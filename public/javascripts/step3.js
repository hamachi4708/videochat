const Peer = window.Peer;

(async function main() {
  //step2と同じ
  const localVideo = document.getElementById('js-local-video');
  const localId = document.getElementById('js-local-id');

  //step2とほぼ同じ（callとend callに類するもの）
  const joinTrigger = document.getElementById('js-join-trigger');
  const leaveTrigger = document.getElementById('js-leave-trigger');

  //step3から追加
  const videosContainer = document.getElementById('js-videos-container');
  const roomId = document.getElementById('js-room-id');
  const messages = document.getElementById('js-messages');

  //カメラ・マイクの取得
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  localVideo.srcObject = localStream;

  //peerオブジェクトの生成
  const peer = new Peer({
    key: '6b3172b3-ae11-456d-9049-699e0f260a49', //API-key
    debug: 3,
  });

  //サーバーとの接続成功時にこちらのid表示
  peer.on('open', (id) => {
    localId.textContent = id;
  });

  //ルーム参加ボタン押下時の処理
  joinTrigger.addEventListener('click', () => {
    //sfuモードを利用する（p2pを複数人でやると通信量がやばいので、サーバーに仲介してもらうイメージ）
    const room = peer.joinRoom(roomId.value, {
      mode: 'sfu',
      stream: localStream,
    });

    //自分が参加したときのメッセージ表示処理
    room.on('open', () => {
      messages.textContent += `===You joined===\n`;
    });

    //他者が参加したときのメッセージ表示処理
    room.on('peerJoin', peerId => {
      messages.textContent += `===${peerId} joined===\n`;
    });

    //映像と音声を授受するタイミングで、表示を追加
    room.on('stream', async stream => {
      const remoteVideo = document.createElement('video');
      remoteVideo.srcObject = stream;
      remoteVideo.playsInline = true;
      remoteVideo.setAttribute('data-peer-id', stream.peerId);
      videosContainer.append(remoteVideo);

      await remoteVideo.play().catch(console.error);
    });

    //他者が退室した時の処理：対象ユーザーのコネクションを削除し、不要な伝送を停止し、メッセージを表示する。
    room.on('peerLeave', peerId => {
      const remoteVideo = videosContainer.querySelector(`[data-peer-id="${peerId}"]`);
      remoteVideo.srcObject.getTracks().forEach(track => {
        track.stop();
      });
      remoteVideo.srcObject = null;
      remoteVideo.remove();

      messages.textContent += `===${peerId} left===\n`;
    });

    //自分が退室したときの処理：メッセージを表示し、全てのユーザーのコネクションを削除・不要な伝送の停止。
    room.once('close', () => {
      messages.textContent += '===You left ===\n';
      const remoteVideos = videosContainer.querySelectorAll('[data-peer-id]');
      Array.from(remoteVideos)
        .forEach(remoteVideo => {
          remoteVideo.srcObject.getTracks().forEach(track => track.stop());
          remoteVideo.srcObject = null;
          remoteVideo.remove();
        });
    });

    //退室ボタンにイベント追加
    leaveTrigger.addEventListener('click', () => {
      room.close();
    }, { once: true });
  });

  peer.on('error', console.error);
})();