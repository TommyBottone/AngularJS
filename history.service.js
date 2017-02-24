var app = angular.module("Calculator", []);
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
  