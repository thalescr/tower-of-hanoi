import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
import { getFirestore, collection, addDoc, setDoc, doc } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-firestore.js";

$(document).ready(function() {
  var holding = [],
  moves,
  disksNum = 7,
  minMoves = 127,
  $canves = $('#canves'),
  $restart = $canves.find('.restart'),
  $tower = $canves.find('.tower'),
  $scorePanel = $canves.find('#score-panel'),
  $movesCount = $scorePanel.find('#moves-num'),
  statistics = null;

  var uploadDocument = loadFirestore();

  function loadFirestore() {
    var firebaseConfig = {
      apiKey: "AIzaSyBLX0et0RmxWhPQgOPAOijcglSIVzWparE",
      authDomain: "tower-of-hanoi-e1075.firebaseapp.com",
      projectId: "tower-of-hanoi-e1075",
      storageBucket: "tower-of-hanoi-e1075.appspot.com",
      messagingSenderId: "682111683740",
      appId: "1:682111683740:web:a69a4304d6de07b4573159"
    };
    var app = initializeApp(firebaseConfig);
    var db = getFirestore(app);
    var statsCollection = collection(db, 'statistics');

    return function (value) {
      var statisticsUid = localStorage.getItem('suid');
      if (!statisticsUid) {
        return addDoc(statsCollection, value)
          .then(function (response) {
            localStorage.setItem('suid', response.id);
            return response;
          });
      }
      return setDoc(doc(db, 'statistics', statisticsUid), value);
    };
  }

  function setStatistics(sendToServer) {
    localStorage.setItem('statistics', JSON.stringify(statistics));

    if (sendToServer) {
      uploadDocument(statistics);
    }
  }

  function getStatistics() {
    var rawStats = localStorage.getItem('statistics');
    if (rawStats) {
      try {
        statistics = JSON.parse(rawStats);
        return statistics;
      } catch { }
    }
    statistics = {
      name: '',
      gender: '',
      time: 0,
      moves: 0,
      startedTime: new Date(),
      finished: false
    };
    getUserData();
    return statistics;
  }

  function getUserData() {
    swal({
      text: 'Seu nome:',
      content: 'input',
      button: {
        text: 'Próximo',
        closeModal: false
      }
    })
    .then(function (name) {
      statistics.name = name;
      swal({
        text: 'Sexo:',
        buttons: {
          male: {
            text: 'Masculino',
            value: 'M'
          },
          female: {
            text: 'Feminino',
            value: 'F'
          }
        }
      })
      .then(function (gender) {
        statistics.gender = gender;
        swal({
          title: 'Bom jogo!',
          buttons: {
            start: {
              text: 'Iniciar!',
              value: true
            }
          }
        });
      });
    })
    .catch(function (err) {
      if (err) {
        console.log(err);
        swal('Erro!', 'Houve um erro ao enviar sua resposta!', 'error');
      } else {
        swal.stopLoading();
        swal.close();
      }
    });
  }

  function initGame(tower) {
    getStatistics();

    if (!statistics.finished) {
      statistics.startedTime = new Date();
    }

    $tower.html('');
    moves = 0;
    $movesCount.html(0);
    holding = [];
    for (var i = 1; i <= disksNum; i++) {
      tower.prepend($('<li class="disk disk-' + i + '" data-value="' + i + '"></li>'));
    }
  }

  function countMove() {
    moves++;
    $movesCount.html(moves);
    if (!statistics.finished) {
      var elapsedTime = (new Date() - statistics.startedTime) / 1000;
      var willSendToServer = (moves % 30 === 0) || (statistics.time - elapsedTime > 60);
      statistics.moves = moves;
      statistics.time = elapsedTime;
      setStatistics(willSendToServer);
    }

    if (moves > minMoves - 1) {
      if ($tower.eq(1).children().length === disksNum || $tower.eq(2).children().length === disksNum) {
        statistics.finished = true;
        setStatistics(true);
        swal({
          allowEscapeKey: false,
          allowOutsideClick: false,
          title: 'Parabens! Montou em ' + moves + ' movimentos',
          text: '🚀🎉🚀🎉',
          type: 'success',
          confirmButtonColor: '#8bc34a',
          confirmButtonText: 'Jogar novamente!'
        }).then(function(isConfirm) {
          if (isConfirm) {
            initGame($tower.eq(0));
          }
        })
      }
    }
  }

  function tower(tower) {
    var $disks = tower.children(),
    $topDisk = tower.find(':last-child'),
    topDiskValue = $topDisk.data('value'),
    $holdingDisk = $canves.find('.hold');

    if ($holdingDisk.length !== 0) {
      if (topDiskValue === holding[0]) {
        $holdingDisk.removeClass('hold');
      } else if (topDiskValue === undefined || topDiskValue > holding[0]) {
        $holdingDisk.remove();
        tower.append($('<li class="disk disk-' + holding[0] + '" data-value="' + holding[0] + '"></li>'));
        countMove();
      }
    } else if ($topDisk.length !== 0) {
      $topDisk.addClass('hold');
      holding[0] = topDiskValue;
    }
  }

  initGame($tower.eq(0));

  $canves.on('click', '.tower', function() {
    var $this = $(this);
    tower($this);
  });

  $restart.on('click', function() {
    swal({
      allowEscapeKey: false,
      allowOutsideClick: false,
      title: 'Tem certeza?',
      text: 'O seu progresso será perdido!',
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8bc34a',
      cancelButtonColor: '#e91e63',
      confirmButtonText: 'Sim, reiniciar o jogo!'
    }).then(function(isConfirm) {
      if (isConfirm) {
        initGame($tower.eq(0));
      }
    })
  });
});
