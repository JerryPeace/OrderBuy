export const NODE_ENV = process.env.NODE_ENV;
export const PROFILE = process.env.AWS_PROFILE || '';

export const config = {
  PROFILE,
  NODE_ENV,
};

export default config;
