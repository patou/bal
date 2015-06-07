// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

app.controller("BarCodeController", ['$scope', '$cordovaBarcodeScanner', '$http', '$ionicModal', '$ionicPopup', function($scope, $cordovaBarcodeScanner, $http, $ionicModal, $ionicPopup) {
	$scope.nom = '';
	$scope.prenom = '';
	
	$scope.cancel = function() {
		$scope.modal.hide();
	}
	
	$scope.valid = function(invite) {
		var alertPopup = $ionicPopup.alert({
		 title: 'Validation',
		 scope: $scope,
		 template: '{{invite.prenom}} {{invite.nom}} est bien validé pour venir au bal des parisiennes',
		 buttons: [
		  {
			text: '<b>Ok</b>',
			type: 'button-assertive'
		  }
		]
	   });
	   alertPopup.then(function(res) {
		 console.log('valid');
		 $scope.modal.hide();
	   });
	}
	
	$scope.openModal = function(invite) {
		console.log(invite);
		$scope.invite = invite;
		$ionicModal.fromTemplateUrl('valid.html', function($ionicModal) {
					$scope.modal = $ionicModal;
					$ionicModal.show();
				}, {
					// Use our scope for the scope of the modal to keep it simple
					scope: $scope,
					// The animation we want to use for the modal entrance
					animation: 'slide-in-up'
				});
	}
	
	$scope.displayResultSearch = function(result) {
		console.log(result);
		$scope.result = result;
		$ionicModal.fromTemplateUrl('result.html', function($ionicModal) {
					$scope.modal = $ionicModal;
					$ionicModal.show();
				}, {
					// Use our scope for the scope of the modal to keep it simple
					scope: $scope,
					// The animation we want to use for the modal entrance
					animation: 'slide-in-up'
				});
	}
	
	$scope.check = function(text) {
		var split = text.split(',');
		console.log(split);
		if (split.length > 1) {
			var id = split[0];
			$http.get('http://www.baldesparisiennes.com/billets/check.php?inviteId='+id).success(function(result) {
				$scope.openModal(result);
			});
			//$scope.openModal({id:split[0],prenom:split[1],nom:split[2], email:split[3]});
		}			
	}
	
	$scope.search = function(nom, prenom) {
		if (nom != '' || prenom != '') {
			$http.get('http://www.baldesparisiennes.com/billets/search.php?nom='+nom+'&prenom='+prenom).success(function(result) {
				$scope.displayResultSearch(result);
				$scope.nom = '';
				$scope.prenom = '';
			});			
		}
	}
	
	
	
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
			$scope.check(imageData.text);
            console.log("Barcode Format -> " + imageData.format);
            console.log("Cancelled -> " + imageData.cancelled);
        }, function(error) {
            console.log("An error happened -> " + error);
        });
    };
 
}]);