import React, { useState, useEffect, useRef } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Text, Center } from '@chakra-ui/react';
import { IoMdArrowRoundDown, IoMdArrowRoundUp } from 'react-icons/io';
import { toast, ToastContainer } from 'react-toastify';
import formator from '@@src/utils/formator';

type Order = {
  price: number;
  size: number;
};

type Orders = {
  buys: Order[];
  sells: Order[];
};

const OrderBook: React.FC = () => {
  const [orders, setOrders] = useState<Orders>({ buys: [], sells: [] });
  const [lastPrice, setLastPrice] = useState<number | null>(null);
  const prevLastPriceRef = useRef<number | null>(null);
  const prevOrdersRef = useRef<Orders>({ buys: [], sells: [] });

  useEffect(() => {
    // OrderBook WebSocket Connection
    const orderBookWs = new WebSocket('wss://ws.btse.com/ws/oss/futures');
    // Last Price WebSocket Connection
    const lastPriceWs = new WebSocket('wss://ws.btse.com/ws/futures');

    const subscribeToChannels = () => {
      if (orderBookWs.readyState === WebSocket.OPEN) {
        orderBookWs.send(JSON.stringify({ op: 'subscribe', args: ['update:BTCPFC'] }));
      }
      if (lastPriceWs.readyState === WebSocket.OPEN) {
        lastPriceWs.send(JSON.stringify({ op: 'subscribe', args: ['tradeHistoryApi:BTCPFC'] }));
      }
    };

    orderBookWs.onopen = subscribeToChannels;
    lastPriceWs.onopen = subscribeToChannels;

    orderBookWs.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.data?.type === 'snapshot' || message.data?.type === 'delta') {
        prevOrdersRef.current = orders;
        const updateData = message.data;
        setOrders((prevOrders) => {
          const updatedBuys = updateData.bids.map(([price, size]: any) => ({
            price: parseFloat(price),
            size: parseFloat(size),
          }));
          const updatedSells = updateData.asks.map(([price, size]: any) => ({
            price: parseFloat(price),
            size: parseFloat(size),
          }));

          const newBuys = [...prevOrders.buys, ...updatedBuys];
          const newSells = [...prevOrders.sells, ...updatedSells];

          newBuys.sort((a, b) => b.price - a.price);
          newSells.sort((a, b) => b.price - a.price);

          const trimmedBuys = newBuys.slice(0, 8);
          const trimmedSells = newSells.slice(0, 8);

          return {
            buys: trimmedBuys,
            sells: trimmedSells,
          };
        });
      }
    };

    lastPriceWs.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.data && message.data.length > 0) {
        const lastTrade = message.data[0]; // Assuming the most recent trade is first
        prevLastPriceRef.current = lastPrice;
        setLastPrice(lastTrade.price);
      }
    };

    orderBookWs.onerror = lastPriceWs.onerror = () => toast.error('WebSocket error');
    return () => {
      orderBookWs.close();
      lastPriceWs.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastPrice]);

  const calculateTotal = (index: number, isBuy: boolean): string => {
    const slice = isBuy ? orders.buys.slice(0, index + 1) : orders.sells.slice(0, index + 1);
    const total = slice.reduce((acc, order) => acc + order.size, 0);
    return formator.formatNumber(total);
  };

  const rowHoverBg = { _hover: { backgroundColor: '#1E3059', color: '#F0F4F8' } };
  let lastPriceStyle = { color: '#F0F4F8', backgroundColor: 'rgba(134, 152, 170, 0.12)' };
  let lastPriceIcon = null;
  if (lastPrice && prevLastPriceRef.current !== null) {
    lastPriceIcon =
      lastPrice > prevLastPriceRef.current ? (
        <IoMdArrowRoundUp size={20} />
      ) : (
        <IoMdArrowRoundDown size={20} />
      );
    lastPriceStyle =
      lastPrice > prevLastPriceRef.current
        ? { color: '#00b15d', backgroundColor: 'rgba(16, 186, 104, 0.12)' }
        : { color: '#FF5B5A', backgroundColor: 'rgba(255, 90, 90, 0.12)' };
  }

  // Function to determine the className based on the comparison
  const getRowClassName = (order: Order, isBuy: boolean) => {
    const prevOrders = prevOrdersRef.current;
    const match = (isBuy ? prevOrders.buys : prevOrders.sells).find((o) => o.price === order.price);
    if (!match) {
      return 'new-quote'; // New quote
    } else if (match.size < order.size) {
      return 'increase-size'; // Size increased
    } else if (match.size > order.size) {
      return 'decrease-size'; // Size decreased
    }
    return '';
  };

  return (
    <Box bg="#131B29" p={4} color="#F0F4F8" w={310}>
      <ToastContainer />
      <Table size="sm" fontWeight={'bold'}>
        <Thead>
          <Tr>
            <Th color="#8698aa">Price (USD)</Th>
            <Th color="#8698aa">Size</Th>
            <Th color="#8698aa">Total</Th>
          </Tr>
        </Thead>
        <Tbody>
          {/* sells orders */}
          {orders.sells.map((order, index) => (
            <Tr
              key={index}
              className={getRowClassName(order, false)}
              style={{ ...rowHoverBg, textAlign: 'center' }}
            >
              <Td color="#FF5B5A">{formator.formatPrice(order.price)}</Td>
              <Td textAlign="right">{formator.formatNumber(order.size)}</Td>
              <Td textAlign="right">{calculateTotal(index, false)}</Td>
            </Tr>
          ))}
          {/* Last price */}
          <Tr style={lastPriceStyle}>
            <Td colSpan={3} textAlign="center" py={3}>
              <Center>
                <Text fontSize="xl" fontWeight={'800'}>
                  {lastPrice ? formator.formatPrice(lastPrice) : '-'}
                </Text>
                {lastPriceIcon}
              </Center>
            </Td>
          </Tr>
          {/* buys orders */}
          {orders.buys.map((order, index) => (
            <Tr
              key={index}
              className={getRowClassName(order, true)}
              style={{ ...rowHoverBg, textAlign: 'center' }}
            >
              <Td color="#00b15d">{formator.formatPrice(order.price)}</Td>
              <Td textAlign="right">{formator.formatNumber(order.size)}</Td>
              <Td textAlign="right">{calculateTotal(index, true)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default OrderBook;
