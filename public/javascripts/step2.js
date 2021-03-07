const Peer = window.Peer;

(async function main() {
  const localVideo = document.getElementById('js-local-video');
  const localId = document.getElementById('js-local-id');
  const remoteVideo = document.getElementById('js-remote-video');
  const remoteId = document.getElementById('js-remote-id');
  const connectedId = document.getElementById('js-connected-id');
  const callTrigger = document.getElementById('js-call-trigger');
  const closeTrigger = document.getElementById('js-close-trigger');

  //受電及び打電時に行う共通処理
  function setupCallEventHandlers(mediaConnection) {
    //接続中のID表示
    connectedId.textContent = mediaConnection.remoteId;

    //「コネクションが繋がったら、接続相手のストリームを表示し続ける」という処理を追加
    //on:〜し続ける（だと思う）
    mediaConnection.on('stream', stream => {
      remoteVideo.srcObject = stream;
    });

    //「切断するときは、もろもろ綺麗にする」という処理を追加
    //once:一度だけ〜する（だと思う）
    mediaConnection.once('close', () => {
      //全てのトラックの停止
      remoteVideo.srcObject.getTracks().forEach(track => {
        track.stop();
      });

      //表示に利用したDOMの初期化
      remoteVideo.srcObject = null;
      connectedId.textContent = '...';
    });

    //停止ボタンに「コネクションの切断」する処理を追加
    closeTrigger.addEventListener('click', () => {
      mediaConnection.close(true);
    });
  }

  const localStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: {
        min: 120,
        ideal: 120
      },
      height: {
        min: 120,
        ideal: 120
      }
    }
  });
  localVideo.srcObject = localStream;

  const peer = new Peer({
    key: '6b3172b3-ae11-456d-9049-699e0f260a49', //API-key
    debug: 3 //ログレベル：完全
  });

  //サーバーとの接続成功時にこちらのid表示
  peer.on('open', (id) => {
    localId.textContent = id;
  });

  //受電処理：相手からの接続要求時の処理
  peer.on('call', mediaConnection => {
    //応答処理
    mediaConnection.answer(localStream);

    //共通処理の実行
    setupCallEventHandlers(mediaConnection);
  });

  //打電処理：こちらから通話を始めるときの処理（打電ボタンへのイベント追加）
  callTrigger.addEventListener('click', () => {
    //peer通話を開始する
    const mediaConnection = peer.call(remoteId.value, localStream);

    //共通処理の実行
    setupCallEventHandlers(mediaConnection);
  });

  //エラー発生時にコンソールにエラーを表示する
  peer.on('error', console.error);

})();