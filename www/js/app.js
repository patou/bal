// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova', 'firebase'])
.constant('Config': {
  firebaseUrl: 'https://bal-des-parisiennes.firebaseio.com/',
  firebaseUser: 'contact@baldesparisiennes.com',
  firebasePassword: 'bal17parisiennes'
  apiUrl: 'http://www.baldesparisiennes.com/billetterie/admin/'
})
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

.controller("BalController", ['$scope', '$cordovaBarcodeScanner', '$http', '$ionicModal', '$ionicPopup', '$ionicLoading', '$ionicPopover', '$timeout', 'Config', function($scope, $cordovaBarcodeScanner, $http, $ionicModal, $ionicPopup, $ionicLoading, $ionicPopover, $timeout, Config) {
	$scope.nom = '';
	$scope.prenom = '';
	var itemsRef = new Firebase(Config.firebaseUrl);
	function authHandler(error, authData) {
	  if (error) {
		console.log("Login Failed!", error);
	  } else {
		$scope.authenticated = true;
		console.log("Authentification OK", error);
		$scope.$digest();
	  }
	}
	itemsRef.authWithPassword({email:Config.firebaseUser, password:Config.firebasePassword}, authHandler);

  $scope.getProductIcon = function(type) {
		if (type) {
			if (type.startsWith("VIP"))
				return 'ion-android-bar';
			else if (type.startsWith("DINER"))
				return 'ion-android-restaurant';
			else if (type.startsWith("SPECTACLE"))
				return 'ion-android-film';
			else if (type.startsWith("SOIREE"))
				return 'ion-music-note';
		}
		return '';
	};
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

	$scope.closeAll = function() {
		$scope.modal.hide();
		if ($scope.resultmodal) {
			//$scope.resultmodal.hide();
		}
		$scope.nom = '';
		$scope.prenom = '';
	}

	$scope.error = function(error) {
		$scope.error = error.error || error;
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
		   });
		   alertPopup.then(function(res) {

		   });

		$timeout(function() {
			 alertPopup.close(); //close the popup after 3 seconds for some reason
		  }, 3000);
	}

	$scope.valid = function(invite) {
		$http.get(Config.apiUrl + 'valid.php?inviteId='+invite.id).success(function(result) {
			invite.valider = 'true';
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
				$scope.modal.hide();
		   });
		    $timeout(function() {
				alertPopup.close(); //close the popup after 3 seconds for some reason
			  }, 2000);
		})
		.error(function(error) {
			$scope.error(error);
		});

		itemsRef.child(''+invite.id).child('valider').set("true");
	}

	$scope.validerInvites = function(invites) {
		var ids = [];
		var validInvites = [];
		angular.forEach(invites, function(invite) {
			if (invite.valider != 'true' && invite.check) {
				this.push(invite.id);
				validInvites.push(invite.prenom + ' '+invite.nom);
				itemsRef.child(''+invite.id).child('valider').set("true");
			}
		}, ids);
		if (ids.length > 0) {
			$http.get(Config.apiUrl + 'valid.php?inviteId='+ids.join(',')).success(function(result) {
				$scope.validInvites = validInvites;
				var alertPopup = $ionicPopup.alert({
				 title: 'Validation',
				 scope: $scope,
				 template: '{{validInvites.join(", ")}} ont bien été validé pour venir au bal des parisiennes',
				 buttons: [
				  {
					text: '<b>Ok</b>',
					type: 'button-assertive'
				  }
				]
			    });
			    alertPopup.then(function(res) {
					$scope.modalClient.hide();
			    });
				$timeout(function() {
					alertPopup.close(); //close the popup after 3 seconds for some reason
				  }, 2000);
			})
			.error(function(error) {
				$scope.error(error);
			});
		}
		else {
			$scope.modalClient.hide();
		}
	};

	$scope.openModal = function(invite) {
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

	$scope.openModalClient = function(client) {
		$scope.client = client;
		$ionicModal.fromTemplateUrl('valid_client.html',{
			// Use our scope for the scope of the modal to keep it simple
			scope: $scope,
			// The animation we want to use for the modal entrance
			animation: 'slide-in-up'
		}).then(function(popover) {
			$scope.modalClient = popover;
			popover.show(window);
		});
	}

	$scope.displayResultSearch = function(result) {
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

	$scope.checkClient = function(id) {
    $ionicLoading.show({
      template: 'Recherche...'
    });
		$http.get(Config.apiUrl + 'client.php?idClient='+id).success(function(result) {
      $ionicLoading.hide();
			if (!result) {
				$scope.error("Ce billet n'existe pas !");
			}
			else {
				$scope.openModalClient(result);
			}
		})
		.error(function(error) {
      $ionicLoading.hide();
			$scope.error(error);
		});
	}

	$scope.check = function(text) {
		var split = text.split(',');
		console.log(split);
		if (split.length > 1) {
			var id = split[0];
			$scope.checkClient(id);
		}
	}

	$scope.search = function(nom, prenom) {
		if (nom != '' || prenom != '') {
			$scope.noresult = false;
      $ionicLoading.show({
        template: 'Recherche...'
      });
			$http.get(Config.apiUrl + 'search.php?nom='+nom+'&prenom='+prenom).success(function(result) {
        $ionicLoading.hide();
				if (!result || result.length == 0) {
					$scope.noresult = true;
				}
				else {
					$scope.displayResultSearch(result);
				}
			})
			.error(function(error) {
        $ionicLoading.hide();
				$scope.error(error);
			});
		}
	}



    $scope.scanBarcode = function() {
		if(window.cordova && window.cordova.plugins.barcodeScanner) {
			$cordovaBarcodeScanner.scan().then(function(imageData) {
				$scope.check(imageData.text);
			}, function(error) {
				$scope.error(error);
			});
		}
		else {
			$scope.checkClient(window.prompt("Id client", "59"));
		}
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
