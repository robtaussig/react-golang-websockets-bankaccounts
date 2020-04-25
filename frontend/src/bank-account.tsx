import React, { useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { useParams } from "react-router-dom";

const SOCKET_URL = 'wss://echo.websocket.org';
const CONNECTION_STATUSES = {
  [ReadyState.CONNECTING]: "Connecting",
  [ReadyState.OPEN]: "Open",
  [ReadyState.CLOSING]: "Closing",
  [ReadyState.CLOSED]: "Closed",
};

const calculateBalance = (message: string) =>
  (prevBalance: (number | null)) => {
    let balance = prevBalance ?? 0;
    return balance + Number(message);
  };

const BankAccount = () => {
  const { account_id } = useParams();
  const [balance, setBalance] = useState<number | null>(null);
  const [deposit, setDeposit] = useState<number>(0);

  const [sendMessage, lastMessage, readyState, getWebSocket] = useWebSocket(
    SOCKET_URL
  );

  const connectionStatus = CONNECTION_STATUSES[readyState];

  useEffect(() => {
    if (lastMessage !== null) {
      // getWebSocket returns the WebSocket wrapped in a Proxy.
      // This is to restrict actions like mutating a shared websocket, overwriting handlers, etc
      const currentWebsocketUrl = getWebSocket().url;
      console.log(
        `received message ${JSON.stringify(
          lastMessage.data,
          null,
          2
        )} from ${currentWebsocketUrl}`
      );

      setBalance(calculateBalance(lastMessage.data))
    }
  }, [lastMessage, getWebSocket, setBalance]);

  useEffect(() => {
    if (connectionStatus === 'Open') {
      console.log('socket opened');

      return () => console.log('closing');
    }
  }, [connectionStatus, sendMessage]);

  // @ts-ignore
  const handleDeposit = async (event) => {

    event.preventDefault();

    sendMessage(String(deposit));
  };

  console.log("re-render");

  return (
    <div>
      <h2>Account {account_id}</h2>
      <div>The WebSocket is currently {connectionStatus}</div>
      {lastMessage ? <div>Last message: {lastMessage.data}</div> : null}
      <div>Your balance is {balance === null ? "unknown" : balance}</div>
      <form onSubmit={handleDeposit}>
        <label>
          Deposit:
          <input
            type="text"
            value={deposit}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setDeposit(+event.target.value)
            }
          />
        </label>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};

export default BankAccount;
