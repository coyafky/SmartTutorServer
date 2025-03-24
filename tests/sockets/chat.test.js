const io = require('socket.io-client');
const { createServer } = require('http');
const { Server } = require('socket.io');

describe('Chat Socket Tests', () => {
  let clientSocket;
  let serverSocket;
  let httpServer;
  let ioServer;

  beforeAll((done) => {
    httpServer = createServer();
    ioServer = new Server(httpServer);
    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = io(`http://localhost:${port}`, {
        auth: {
          token: 'test_token'
        }
      });
      ioServer.on('connection', (socket) => {
        serverSocket = socket;
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    ioServer.close();
    clientSocket.close();
    httpServer.close();
  });

  test('应该能发送和接收消息', (done) => {
    clientSocket.emit('sendMessage', {
      to: 'TEST_USER_2',
      message: '测试消息'
    });

    serverSocket.on('sendMessage', (data) => {
      expect(data.message).toBe('测试消息');
      done();
    });
  });
});