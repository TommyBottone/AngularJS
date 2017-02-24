var app = angular.module("Calculator", []);
//Calculator Controller
app.controller("CalculatorController", ['$scope', "HistoryMockService", function($scope, HistoryMockService){
  $scope.title = "Four Function Calculator";
  $scope.sum=0;
  $scope.history = [];
  $scope.curNumber = "0";
  $scope.operation = [];
  
  var prev = "0";
  var allowOper = false;
  var selectedHistory = -1;

  /*
   *  clear 
   *  assentially a reset
   */
  $scope.clear = function(){
    $scope.sum=0;
    HistoryMockService.resetHistory();
    $scope.curNumber = "0";
    prev = "0";
    allowOper = false;
    $scope.operation = [];
  }
  /*
   *  delete 
   *  allow user to delete
   */
  $scope.delete = function(){
    if(isNaN($scope.operation[$scope.operation.length-1])){
        return; //too bad
    }
    if($scope.curNumber.length <= 1){
      $scope.curNumber = "0";
    }else{
      $scope.curNumber = $scope.curNumber.toString().substring(0, $scope.curNumber.length - 1);
    }
    $scope.operation[$scope.operation.length-1] = $scope.curNumber;
  }
  /*
   *  numClick 
   *  @Param val - number that was clicked
   */
  $scope.numClick = function(val){
    if($scope.curNumber =="0"){
      $scope.curNumber = "";
    }
    $scope.curNumber += "" + val;
    allowOper = true;
    if($scope.operation.length == 0 || isNaN($scope.operation[$scope.operation.length-1])){
      $scope.operation.push($scope.curNumber);
    }else{
      $scope.operation[$scope.operation.length-1] = $scope.curNumber;
    }
  }
  /*
   *  saveToHistory 
   *  solves the equation
   *  then saves it to history buffer
   */
  $scope.saveToHistory = function(){
    var historyVal = solve();
    //Add value to history 
    HistoryMockService.addToHistory(historyVal).then(function(rsp){
      $scope.history = rsp;
      prev = "0";
      $scope.curNumber = "0";
      $scope.operation = [];
    }, function(err){
      console.log(err);
    });
  }
  /*
   *  solve 
   *  solves the equation
   *  I Noticed Windows doesnt do order of operations....so I am not either
   */
  function solve(){
    var solution = "0";
    //always start with a +
    var operator = "+";
    for(var i = 0; i < $scope.operation.length; i++){
      if(isNaN($scope.operation[i])){
        operator = $scope.operation[i];
        continue;
      }
      switch(operator){
        case "+": solution = parseFloat(solution) + parseFloat($scope.operation[i]); break;
        case "-": solution = parseFloat(solution) - parseFloat($scope.operation[i]); break;
        case "*": solution = parseFloat(solution) * parseFloat($scope.operation[i]); break;
        case "/": solution = parseFloat(solution) / parseFloat($scope.operation[i]); break;
        default: break;
      }
    }
    var historyVal = {
      "operation":$scope.operation,
      "value":solution       
    }
    return historyVal;
    
  }  
  //Add operation
  $scope.addOper = function(){
    updateOperation("+");
  }
  //Subtract operation
  $scope.subOper = function(){
    updateOperation("-");
  }
  //Multiply operation
  $scope.mulOper = function(){
   updateOperation("*");
  }
  //Division operation
  $scope.divOper = function(){
   updateOperation("/");
  }
  /*
  *  updateOperation 
  *  @Param val - value to add to history
  */
  function updateOperation(oper){
  if(!allowOper){
    return;
  }
  if(isNaN($scope.operation[$scope.operation.length-1])){
    $scope.operation[$scope.operation.length-1] = oper;
  }else{
    $scope.operation.push(oper);
  }
  prev = $scope.curNumber;
  $scope.curNumber = "0";
  }   
  /*
   *  setOperation 
   *  @Param val - value to set as current operation
   */
  $scope.setOperation = function(idx){
    HistoryMockService.setIndex(idx);
    HistoryMockService.historyBufferRestored().then(function(rsp){
      $scope.operation = rsp.operation;
      $scope.curNumber = rsp.value;
    },function(err){
      console.log("Cound not restore");
    });
  }
}]);
//Mock service provider
app.config(function($provide){
  $provide.factory('HistoryMockService', function($q) {
    var history = [];
    var index = -1;
    return{
      //Add value to history
      addToHistory: function(val){
        if(index > -1){
          history[index] = val;
        }else{
          history.push(val);
        }
        index = -1;
        return this.historyBufferChanged();
      },
      //get history
      getHistory: function(){
        return this.historyBufferChanged();
      },
      //reset history
      resetHistory: function(){
        history = [];
        return this.historyBufferChanged();
      },
      //set a current index for history
      setIndex: function(idx){
        index = idx;
      },
      //called whenever there is a change to the history buffer
      historyBufferChanged: function(){
        var deferred = $q.defer();
        deferred.resolve(history);
        return deferred.promise;
      },
      //Called whenever grabbing a value from the buffer
      historyBufferRestored: function(){
        var deferred = $q.defer();
        deferred.resolve(history[index]);
        return deferred.promise;
      }
    }
  });
});
  