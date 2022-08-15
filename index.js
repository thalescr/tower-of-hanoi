// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-app.js";
// import { getFirestore, collection, addDoc, setDoc, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.8.4/firebase-firestore.js";

$(document).ready(function() {
  var holding = [],
    db,
    moves,
    disksNum = 6,
    minMoves = 63,
    $canves = $('#canves'),
    $restart = $canves.find('.restart'),
    $tower = $canves.find('.tower'),
    $scorePanel = $canves.find('#score-panel'),
    $movesCount = $scorePanel.find('#moves-num'),
    statistics = null;

  // var uploadDocument = loadFirestore();

  // function loadFirestore() {
  //   var firebaseConfig = {
  //     apiKey: "apiKey",
  //     authDomain: "auth-domain.firebaseapp.com",
  //     projectId: "project-id",
  //     storageBucket: "storage-bucket.appspot.com",
  //     messagingSenderId: "messagingSenderId",
  //     appId: "appId"
  //   };
  //   var app = initializeApp(firebaseConfig);
  //   db = getFirestore(app);
  //   var statsCollection = collection(db, 'statistics');

  //   return function (value) {
  //     var statisticsUid = localStorage.getItem('suid');
  //     if (!statisticsUid) {
  //       return addDoc(statsCollection, value)
  //         .then(function (response) {
  //           localStorage.setItem('suid', response.id);
  //           return response;
  //         });
  //     }
  //     return setDoc(doc(db, 'statistics', statisticsUid), value);
  //   };
  // }

  function setStatistics() {
    localStorage.setItem('statistics', JSON.stringify(statistics));

    // if (sendToServer) {
    //   uploadDocument(statistics);
    // }
  }

  function getStatistics() {
    var suid = localStorage.getItem('suid');
    if (suid) {
      return getDoc(doc(db, 'statistics', suid))
        .then(function (response) {
          statistics = response.data();

          if (statistics) {
            localStorage.setItem('statistics', JSON.stringify(statistics));
            return statistics;
          } else {
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
        });
    } else {
      var rawStats = localStorage.getItem('statistics');
      if (rawStats) {
        try {
          statistics = JSON.parse(rawStats);
          return new Promise(function (resolve) { resolve(statistics); });
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
      return new Promise(function (resolve) { resolve(statistics); });
    }
  }

  function getUserData() {
    swal({
      text: 'Seu nome:',
      closeOnClickOutside: false,
      backdrop: true,
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
        closeOnClickOutside: false,
        backdrop: true,
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
    getStatistics().then(function () {
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
    });
  }

  function countMove() {
    moves++;
    $movesCount.html(moves);
    if (!statistics.finished) {
      var elapsedTime = (new Date() - statistics.startedTime) / 1000;
      // var willSendToServer = (moves % 20 === 0 || moves === 1) || (statistics.time - elapsedTime > 30);
      statistics.moves = moves;
      statistics.time = elapsedTime;
      setStatistics();
    }

    if (moves > minMoves - 1) {
      if ($tower.eq(1).children().length === disksNum || $tower.eq(2).children().length === disksNum) {
        statistics.finished = true;
        setStatistics();
        swal({
          closeOnClickOutside: false,
          backdrop: true,
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
