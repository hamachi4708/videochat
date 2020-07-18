(async function main() {
  let localStream = null;
  let peer = null;
  let existingCall = null;

  function setupCallEventHandlers(call) {
    if (existingCall) {
      existingCall.close();
    };

    existingCall = call;

    //データ受信時の処理
    call.on('stream', function (stream) {
      addVideo(call, stream);
      setupEndCallUI();
      $('#connected-peer-id').text(call.remoteId);
    });

    //切断時の処理
    call.on('close', function () {
      removeVideo(call.remoteId);
      setupMakeCallUI();
    });
  }

  function addVideo(call, stream) {
    const videoDom = $('<video autoplay>');
    videoDom.attr('id', call.remoteId);
    videoDom.get(0).srcObject = stream;
    $('.videosContainer').append(videoDom);
  }

  function removeVideo(peerId) {
    $('#' + peerId).remove();
  }

  function setupMakeCallUI() {
    $('#make-call').show();
    $('#end-call').hide();
  }

  function setupEndCallUI() {
    $('#make-call').hide();
    $('#end-call').show();
  }



  const localVideo = document.getElementById('js-local-video');

  localStream = await navigator.mediaDevices.getUserMedia({
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

  peer = new Peer({
    key: '6b3172b3-ae11-456d-9049-699e0f260a49', //API-key
    debug: 3 //ログレベル：完全
  });

  //サーバーとの接続成功時にapi-key表示
  peer.on('open', function () {
    $('#my-id').text(peer.id);
  });

  //相手からの接続要求時の処理：単純な応答処理（必須っぽいし、わざわざ各自で記載する必要ってあるんか？）
  peer.on('call', function (call) {
    call.answer(localStream);
    setupCallEventHandlers(call);
  });

  //エラー発生時にエラーを表示する
  peer.on('error', function (err) {
    alert(err.message);
  });

  //発信処理
  $('#make-call').submit(function (e) {
    e.preventDefault();
    const call = peer.call($('#peer-id').val(), localStream);
    setupCallEventHandlers(call);
  });

  //切断処理
  $('#end-call').click(function () {
    existingCall.close();
  });

  localVideo.srcObject = localStream;
})();