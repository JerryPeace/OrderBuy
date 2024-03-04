#!/usr/bin/env bash
set +x
set -eo pipefail

script_dir=$(dirname $0)

set +eo pipefail
image_temp_tag="$(tr -dc a-z0-9 < /dev/urandom | head -c 8):$(tr -dc a-z0-9 < /dev/urandom | head -c 8)"
set -eo pipefail

if [ -z $TF_BUILD ]; then
  docker build --tag "$image_temp_tag" .
else
  image_from_tag=$(cat "$script_dir/../../docker-image/tag")
  docker load --input "$script_dir/../../docker-image/runtime.tar"
  docker tag "$image_from_tag" "$image_temp_tag"
fi

ssm_parameter_name_base="/${ENVIRONMENT}-svtp"

aws_ecr_info=$(aws ecr get-authorization-token --output json |
  jq -cr '[
    .authorizationData[] | {
      account: (.proxyEndpoint / "://") | (.[1] / ".") | .[0],
      endpoint: (.proxyEndpoint / "://") | .[1],
      username: .authorizationToken | (@base64d / ":") | .[0],
      password: .authorizationToken | (@base64d / ":") | .[1]
    }
  ]'
)

image_tag=$(aws ssm get-parameter \
  --name "${ssm_parameter_name_base}/neptune/task-definition/container" \
  --query 'Parameter.Value' \
  --output text \
)

IFS=$'\n'
for i in $(jq -c '.[]' <<< $aws_ecr_info); do
  docker login \
    $(jq -r '.endpoint' <<< ${i}) \
    --username $(jq -r '.username' <<< ${i}) \
    --password $(jq -r '.password' <<< ${i})

  image_name="$(
    jq -r '.endpoint' <<< ${i}
  )/cdk-hnb659fds-container-assets-$(
    jq -r '.account' <<< ${i}
  )-${AWS_REGION}:$image_tag" &&
  docker tag "$image_temp_tag" "$image_name" &&
  docker push "$image_name"

  docker logout \
    $(jq -r '.endpoint' <<< ${i})
done
unset IFS

cluster_arn=$(aws ssm get-parameter \
  --name "${ssm_parameter_name_base}/cluster/cluster" \
  --query 'Parameter.Value' \
  --output text \
)

service_arn=$(aws ssm get-parameter \
  --name "${ssm_parameter_name_base}/neptune/service" \
  --query 'Parameter.Value' \
  --output text \
)

aws ecs update-service \
  --cluster $cluster_arn \
  --service $service_arn \
  --force-new-deployment \
  --output table

aws ecs wait services-stable \
  --cluster $cluster_arn \
  --service $service_arn \
  --output table
