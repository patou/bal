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

.controller("BalController", ['$scope', '$cordovaBarcodeScanner', '$http', '$ionicModal', '$ionicPopup', '$ionicPopover', '$timeout', function($scope, $cordovaBarcodeScanner, $http, $ionicModal, $ionicPopup, $ionicPopover, $timeout) {
	$scope.nom = '';
	$scope.prenom = '';
	
	$scope.cancel = function() {
		$scope.modal.hide();
	}
	
	$scope.closeWarning = function() {
		$scope.noresult = false;
	}
	
	$scope.cancelResult = function() {
		$scope.resultmodal.hide();
		$scope.nom = '';
		$scope.prenom = '';
	}
	
	$scope.error = function() {
		var alertPopup = $ionicPopup.alert({
			 title: 'Error',
			 scope: $scope,
			 template: 'Une erreur est apparue {{error}} !',
			 buttons: [
			  {
				text: '<b>Fermer</b>',
				type: 'button-assertive'
			  }
			]
		   }).then(function(res) {
			 
		   });
		   
		$timeout(function() {
			 alertPopup.close(); //close the popup after 3 seconds for some reason
		  }, 3000);
	}
	
	$scope.valid = function(invite) {
		$http.get('http://www.baldesparisiennes.com/billets/valid.php?inviteId='+invite.id).success(function(result) {
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
		   }).then(function(res) {
			 console.log('valid');
			 $scope.modal.hide();
		   });
		    $timeout(function() {
				 alertPopup.close(); //close the popup after 3 seconds for some reason
			  }, 3000);
		})
		.error(function(error) {
			$scope.error(error);
		});
	}
	
	$scope.openModal = function(invite) {
		console.log(invite);
		$scope.invite = invite;
		$ionicModal.fromTemplateUrl('valid.html',{
			// Use our scope for the scope of the modal to keep it simple
			scope: $scope,
			// The animation we want to use for the modal entrance
			animation: 'slide-in-up'
		}).then(function(popover) {
			$scope.modal = popover;
			popover.show(window);
		});
	}
	
	$scope.displayResultSearch = function(result) {
		console.log(result);
		$scope.result = result;
		$ionicModal.fromTemplateUrl('result.html', {
			// Use our scope for the scope of the modal to keep it simple
			scope: $scope,
			// The animation we want to use for the modal entrance
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.resultmodal = modal;
			modal.show();
		});
	}
	
	$scope.check = function(text) {
		var split = text.split(',');
		console.log(split);
		if (split.length > 1) {
			var id = split[0];
			$http.get('http://www.baldesparisiennes.com/billets/check.php?inviteId='+id).success(function(result) {
				$scope.openModal(result);
			})
			.error(function(error) {
				$scope.error(error);
			});
			//$scope.openModal({id:split[0],prenom:split[1],nom:split[2], email:split[3]});
		}			
	}
	
	$scope.search = function(nom, prenom) {
		if (nom != '' || prenom != '') {
			$scope.noresult = false;
			$http.get('http://www.baldesparisiennes.com/billets/search.php?nom='+nom+'&prenom='+prenom).success(function(result) {
				if (!result || result.length == 0) {
					$scope.noresult = true;
				}
				else {
					$scope.displayResultSearch(result);
				}
			})
			.error(function(error) {
				$scope.error(error);
			});			
		}
	}
	
	
	
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
			$scope.check(imageData.text);
            console.log("Barcode Format -> " + imageData.format);
            console.log("Cancelled -> " + imageData.cancelled);
        }, function(error) {
            $scope.error(error);
        });
    };
 
}])
.controller('IonicAlertController', ['$scope', '$attrs', function ($scope, $attrs) {
	$scope.closeable = 'close' in $attrs;
	this.close = $scope.close;
}])
.directive('alert', function () {
	return {
		restrict: 'EA',
		controller: 'IonicAlertController',
		template: '<div class=\"card\" role=\"alert\"><a class=\"item item-text-wrap item-icon-right\" ng-class=\"\'alert-\' + type\" href=\"#\"><div ng-transclude></div><i ng-show=\"closeable\" class=\"icon ion-close\" ng-click=\"close()\"></i></a></div>',
    // template: 'templates/alert.html',
		transclude: true,
		replace: true,
		scope: {
			type: '@',
			close: '&'
		}
	};
});