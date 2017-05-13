angular.module('starter.controllers', [])

  .controller('DashCtrl', function ($scope) {})

  .controller('BLECtrl', function ($scope, $ionicPopup, Devices, BLE) {
    ble.isEnabled(
      function () {
        console.log("Bluetooth is enabled");
      },
      function () {
        $ionicPopup.alert({
          title: 'WARNING!',
          template: 'Bluetooth is not enabled!'
        });
      });

    // keep a reference since devices will be added
    $scope.devices = Devices.all();

    var success = function () {
      if ($scope.devices.length < 1) {
        // a better solution would be to update a status message rather than an alert
        alert("Didn't find any Bluetooth Low Energy devices.");
      }
    };

    var failure = function (error) {
      alert(error);
    };

    // pull to refresh
    $scope.onRefresh = function () {
      BLE.scan().then(
        success, failure
      ).finally(
        function () {
          $scope.$broadcast('scroll.refreshComplete');
        }
      )
    }

    // initial scan
    BLE.scan().then(success, failure);

  })

  .controller('BLEDetailCtrl', function ($scope, $stateParams, $log, $ionicPopup, BLE, $interval) {
    $scope.device = null;
    $scope.message = "";
    $scope.firstEnter = true;
    $scope.goodPostrure = true;

    BLE.connect($stateParams.deviceId).then(
      function (peripheral) {
        $scope.device = peripheral;
        BLE.startNotification();
      }
    );

    writeToDevice = function (dest) {
      if ($scope.device == null) return;

      BLE.addQueue(BLE.stringToBytes(dest));
    };

    $scope.calibrate = function () {
      writeToDevice("Calibrate");
      $scope.firstEnter = false;
    }

    $interval(function () {
      $scope.message = BLE.recievedData;
    }, 100);


    $scope.$on("$ionicView.leave", function (event, data) {
      if ($scope.device != null) {
        BLE.stopNotification();
        BLE.disconnect($stateParams.deviceId);
      }
    });
  });
