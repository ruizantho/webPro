var app = angular.module('annonceApp', []);

app.controller('AnnonceController', function($scope, $http) {
    $scope.annonces = [];
    $http.get('/annonce').then(function(response) {
        $scope.annonces = response.data;
    }, function(error) {
        if (error.status === 401) {
            console.error('Erreur 401 - Non autorisé :', error.data.message);
            window.location.href = '/index.html';
        } else {
            console.error('Erreur lors de la récupération des annonces :', error);
        }
    });
    $http.post('/username').then(function(response) {
        $scope.username = response.data.username;
    }).catch(function(error) {
        console.error('Erreur lors de la récupération des informations de l’utilisateur:', error);
    });
});
