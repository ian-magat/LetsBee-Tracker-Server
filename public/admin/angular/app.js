var app = angular.module('angularjs-starter', [ 'ui.bootstrap.pagination' ]);

app.factory( 'myData', function() {
  scope.data = [];
  
 
  
  socket.on('connect', function () {
    socket.emit('ferret', 'tobi', function (data) {
        console.log(data); // data will be 'woot'
        $scope.$apply(function () { $scope.data = data; });
    });
})


socket.on('reload', function (msg) {
  console.log(msg);
  $scope.$apply(function () { $scope.data = msg; });
});

  return {
    get: function(offset, limit) {
      return scope.data.slice( offset, offset+limit );
    },
    count: function() {
      return scope.data.length;
    }
  };
});

app.controller('MainCtrl', function($scope, myData) {
  $scope.numPerPage = 5;
  $scope.noOfPages = Math.ceil(myData.count() / $scope.numPerPage);
  $scope.currentPage = 1;

  $scope.setPage = function () {
    $scope.data = myData.get( ($scope.currentPage - 1) * $scope.numPerPage, $scope.numPerPage );
  };
  
  $scope.$watch( 'currentPage', $scope.setPage );
});