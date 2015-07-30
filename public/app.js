 var appModule = angular.module('app',
     [
         'angular-jwplayer',
         'facebook',
         'ngSanitize',
         'ngScrollbar',
         'ng-iscroll',
         'ngCookies',
         'luegg.directives',
         'ngDialog',
         'useInfoServices',
         'editProfileServices',
         'ngMap',
         'ngScrollbar'
     ])
  .constant('geolocation_msgs', {
        'errors.location.unsupportedBrowser':'Browser does not support location services',
        'errors.location.permissionDenied':'You have rejected access to your location',
        'errors.location.positionUnavailable':'Unable to determine your location',
        'errors.location.timeout':'Service timeout has been reached'
})
 .config([
    'FacebookProvider', '$httpProvider', function(FacebookProvider,$httpProvider) {
    //var myAppId = '634546090022475';
    var myAppId = '959772707416251';
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    //var myAppId = '550158861792984'; 
     FacebookProvider.init(myAppId);
             //$httpProvider.defaults.transformRequest = function(data){
             //    if (data === undefined) {
             //        return data;
             //    }
             //    return $.param(data);
             //}
    }
  ])
 .directive('debug', function() {
	return {
		restrict:	'E',
		scope: {
			expression: '=val'
		},
		template:	'<pre>{{debug(expression)}}</pre>',
		link:	function(scope) {
			// pretty-prints
			scope.debug = function(exp) {
				return angular.toJson(exp, true);
			};
		}
	}
    })
 /* Services For Google Login*/
 .service('googleService', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {
            var clientId = '542846836032-ofjpppkdb500kpj9q46rj33g5te3t55d.apps.googleusercontent.com',
                apiKey = 'AIzaSyButZVBVUiuL_cGC9SXvIeBH2VL5ppKjWc',
                scopes = 'https://www.googleapis.com/auth/plus.me https://www.google.com/m8/feeds',
                //domain = '{OPTIONAL DOMAIN}',
                deferred = $q.defer();

            this.login = function ($scope) {
                gapi.auth.authorize({ 
                    client_id: clientId, 
                    scope: scopes, 
                    immediate: false, 
                    //hd: domain 
                }, this.handleAuthResult);  
                return deferred.promise;
            }

            this.handleClientLoad = function () {
                gapi.client.setApiKey(apiKey);
                gapi.auth.init(function () { });
                window.setTimeout(checkAuth, 1);
            };

            this.checkAuth = function() {
                gapi.auth.authorize({ 
                    client_id: clientId, 
                    scope: scopes, 
                    immediate: true, 
                    //hd: domain 
                }, this.handleAuthResult);
            };

            this.handleAuthResult = function(authResult) {
                if (authResult && !authResult.error) {
                    var socialData = {};
		    var social ={};
                    gapi.client.load('oauth2', 'v2', function () {
                        var request = gapi.client.oauth2.userinfo.get();
                        request.execute(function (resp) {
                            //$(".userlogged").hide();
                            deferred.resolve(resp);
                
                        });
                         return deferred.promise;
                    });
                    
                   
                }
                else {
                    deferred.reject('error');
                }
            };

            this.handleAuthClick = function(event) {
                gapi.auth.authorize({ 
                    client_id: clientId, 
                    scope: scopes, 
                    immediate: false, 
                    //hd: domain 
                }, this.handleAuthResult);
                return false;
            };

        }]);


$controller = appModule.controller;
  appModule.controller('mainController',['$scope','$rootScope','$http','eventService','sessionService','ServersessionDestroy','$cookies','$cookieStore','ngDialog','socket','beliveUserList','followUserPost',function($scope,$rootScope,$http,eventService,sessionService,ServersessionDestroy,$cookies,$cookieStore,ngDialog,socket,beliveUserList,followUserPost){
	$scope.tab = 'ng-view/watchLive.html'; /*default tab*/
	$scope.signedIn = false;
       eventService.eventVideo().then(function (dataReturn) {
         $scope.eventchListMap = dataReturn.data.result;
         var mapAll = [];
       angular.forEach(dataReturn.data.result, function (k, v) {
         angular.forEach(k, function (k1, v1) {
              mapAll.push(k1);
              });
         });
            $scope.eventchListMap = mapAll;
         });
        $scope.toggleTab = function(s){
		if (s=="Channel") {
                  $scope.tab = 'ng-view/channel.html';
                    selectionMenu("channel_list","");  
                }if (s=="Home") {	   
		   $scope.tab = 'ng-view/watchLive.html';
		   selectionMenu("watch_live","");
		   setTimeout(function(){
		    $rootScope.$broadcast('epgchListVod', $scope.epgchListVod);
			$scope.loadDefaultStream($scope.epgchList);
		    },1000);
                }if (s=="explore") {
                     ngDialog.open({template: 'explore.html', showClose: false,scope : $scope});
                     window.setTimeout(function () {
                            $scope.mapMarkers();
                     }, 2000); 
                }
	};        
	$scope.catSelect = function(catMenu)
        {
	    $scope.defaultCat = catMenu;	    
	    };
	  $scope.$on('event:google-plus-signin-success', function (event,authResult) {
		$scope.getProfileData(authResult);
	  });
	  $scope.$on('event:google-plus-signin-failure', function (event,authResult) {
	    // Auth failure or signout detected
	  });
          
$scope.mapMarkers = function()
{
var eventchListMap = $scope.eventchListMap;
var mapOptions = {
        zoom: 4,
        center: new google.maps.LatLng(21.0000, 78.0000),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    }
    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);
    $scope.markers = [];
    var infoWindow = new google.maps.InfoWindow();
    var createMarker = function (info){
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.latitude, info.longitude),
        });
        marker.content = "<span class='mapInfo' style='color: #000;font-size: 14px'><img src="+info.thumbnail+" width='70px' height='70px'/><h1>"+info.name+"</h1></span>";
        //marker.content = '<div class="infoWindowContent">' + info.name + '</div>';
        google.maps.event.addListener(marker, 'click', function(){
            infoWindow.setContent(marker.content);
            infoWindow.open($scope.map, marker);
        });
        $scope.markers.push(marker); 
    }
    for (i = 0; i < eventchListMap.length; i++){
        createMarker(eventchListMap[i]);
    }
}
    $scope.openInfoWindow = function(e, selectedMarker){
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }
          
	$scope.getProfileData = function(authResult)
	{
	    var social ={};
	    var access_token = authResult['access_token'];
	    var userProfileURL = "https://www.googleapis.com/plus/v1/people/me?access_token="+authResult['access_token'];
	  $http.get(userProfileURL).
              success(function(data, status, headers, config) {
		social['id'] = data.id;
		social['name'] = data.displayName;
		social['gender'] = data.gender;
		social['locale'] = data.language;
		social['link']   = '';
		social['timezone'] = '';
		social['updated_time'] = '';
		social['verified'] = 'true';
		social['dob'] = '10/10/1989';
		social['first_name']= data.name['givenName'];
		social['last_name']= data.name['familyName'];
		angular.forEach(data.placesLived,function(klived,vlived){
		     social['location']= klived.value;
		  });
		angular.forEach(data.emails,function(kmail,vmail){
		     social['email']= kmail.value;
		  });
		$scope.loginApi(social,access_token);
	      });
	    
	}
  $scope.loginApi = function(socialData,access_token)
  {
    var socialData = JSON.stringify(socialData)
    $http({
	method: "POST",
	url: "http://54.179.170.143/multitvfinal/api/user/social/",
	//url : "http://182.18.165.43/multitv_web/requestCheck/serverGet.php",
	data: {'social':socialData,'provider':'google','access_key':'','uniqueID':'1234567889'},
}). success(function(data, status, headers, config) {
                 }).error(function(data, status, headers, config) {
           console.log(data);
        });
  }
  
  $scope.setActive = function(backColor)
  {
    $(this).css("backColor",backColor);
  },
   $scope.setDefaultActive = function(channelId,color)
  {
    var style1 = "background-color: "+color+"";
    if($scope.Defaultchannel==channelId)
    {
	return style1;
    }
  }
/*Session Get*/
       var data = {};
       var url='sessionGet/' ;
       var method ='GET';
       $rootScope.logged = false;
       $rootScope.Flogged = false; 
       $rootScope.Glogged = false;
      $scope.sessionCheck = function () {
       sessionService.sessionSetGet(data,url,method).then(function (returnSession)
       {
             if(returnSession.data!='')
             {
                  $rootScope.logged = true;
                  $rootScope.Flogged = false; 
                  $rootScope.Glogged = false;
                   var userSessionData = returnSession.data.data.result;
                    if (userSessionData.name != " ") {
                        $rootScope.gUserName = userSessionData.first_name+" "+userSessionData.last_name;
                    }else
                    {
                        $rootScope.gUserName = "Unknown User";
                    }
                    //console.log(userSessionData.image);
                    if (userSessionData.image!='' && userSessionData.image!= null) {
                         $rootScope.gUserImage = userSessionData.image;
                    }else
                    {
                         $rootScope.gUserImage="http://54.179.170.143/multiTv_web/photo.jpg";   
                    }
                    $rootScope.width = '80px';
                    $rootScope.height = '50px';
                   
                   var user_id = userSessionData.id;
                    $scope.url1 =  "http://multitvsolution.com/multitvfinal/api/user/list/token/555c89c440634/user_id/"+user_id;
              }else{
                     var user_id = '';
                      $scope.url1 =  "http://multitvsolution.com/multitvfinal/api/user/list/token/555c89c440634/user_id/"+user_id;
              }
              var dataGet = "user_id="+user_id;
              /*Belive User List*/
                 beliveUserList.beliveUser($scope.url1).then(function(dataReturn){
                                     $scope.userList = dataReturn.data.result;
                     });
              /*Belive End User List*/    
       });
       
      }
      $scope.sessionCheck();
/*Session End Get*/       

/* Logout Click */
$scope.logout = function()
{
       ServersessionDestroy.sessionDestroy().then(function(dataReturn){
              
              if ($cookieStore.get('socialDataLogin')) {
			var userName = $cookieStore.get('socialDataLogin').name;
			if ($cookieStore.get('socialDataLogin').picture!='') {
				var picture  = $cookieStore.get('socialDataLogin').picture;
			}else
			{
				var picture = "http://54.179.170.143/multiTv_web/photo.jpg";
			}
		}else
		{
		     var userName= "Unknown User";
		     var picture = "http://54.179.170.143/multiTv_web/photo.jpg";
		}
		if ($cookieStore.get('socialServerData')) {
			var user_id = $cookieStore.get('socialServerData').id;
		}	
	socket.emit('switchRoom',{
					username :userName,
					chatRoomName : $scope.chatEventRoom,
					picture :  picture,
					subscribedFlag : $scope.subscribedUser
					}, function (result) {
						//console.log(result);
					 });
              $cookieStore.remove("socialDataLogin");
              $cookieStore.remove("socialServerData");
              //$(".userInfo").hide();
              $rootScope.logged = false;
              $rootScope.Flogged = false; 
              $rootScope.Glogged = false;
              $rootScope.loggedin = false;
              $rootScope.width = '21px';
              $rootScope.height = '21px';
        });
}
/* Logout Click End*/      
/*Follow User*/
$scope.followUser = function(userId,status)
{
       if ($cookieStore.get('socialServerData')!='' && $cookieStore.get('socialServerData')!=undefined) {
                    var user_id =$cookieStore.get('socialServerData').id;
                    var $data = "user_id="+user_id+"&follow_user_id="+userId+"&status="+status;
                    followUserPost.followUser($data).then(function(dataReturn){
                            beliveUserList.beliveUser($scope.url1).then(function(dataReturn){
                                     $scope.userList = '';
                                     $scope.userList = dataReturn.data.result;
                                     //console.log($scope.userList);
                                     //$scope.$apply();
                            });
                    });
       }else
       {
              ngDialog.open({template: 'templateId',
                controller: 'loginCtrl',
                className: 'ngdialog-theme-flat ngdialog-theme-custom',
                showClose:false });  
       }
}
/*End Follow User*/
  }]);
  appModule.directive('setActive', function(){

  return function(scope, element, attrs){

    element.on('click', function () {
	var bgColorSet = attrs.bgcol;
	$(".channel-info").css("background","");
	$(this).css("background",bgColorSet);
	var parentUlChannel = $(this).attr("channelchNmbr");
	$('ul.timelines').each(function(){
		    var channelNumSubling = $(this).attr('channelNumSubling');
		    if (channelNumSubling == parentUlChannel) {
			    $("ul.timelines").css("background","");
			    $(this).css("background",bgColorSet);
		    }
		    });
    });
  };
}); 
appModule.directive('mySlides', function() {
  var directive = {
    restrict: 'A',
    link: function(scope, element, attrs, ctrl) {
	scope.$watch(attrs.mySlides, function(value) {
	    setTimeout(function() {          
	       $('#va-accordion').vaccordion({
			accordionW		: "",
			accordionH		: 640,
			visibleSlices	: 8,
			expandedHeight	: 640,
			animOpacity		: 0.1,
			contentAnimSpeed: 100
	        });
	    }, 1000);
	});
    }
  };
  return directive;
});
appModule.factory('eventService',function($http){
   return {
     eventVideo: function(callback) {
       //return $http.get('http://54.179.170.143/multitvfinal/api/events/list/token/555c89c440634').
        return $http.get('http://multitvsolution.com/multitvfinal/api/events/list/token/555c89c440634').
              success(function(res, status, headers, config) {
	      if (res.result) {
               return res.result;
	      }
          }).
        error(function(res, status, headers, config) {
           console.log("errror");
        }); 
       
     }
   }    
    });



appModule.factory('subscribeUserList',function($http){
   return {
     subScribeUsers: function(subscribeObj) {
       //console.log(subscribeObj);
        return $http.get("http://multitvsolution.com/multitvfinal/api/user/subscribe_user/id/"+subscribeObj.event_id+"/token/555c89c440634").
        success(function(res, status, headers, config) {
              return res.result;       
        }).
        error(function(res, status, headers, config) {
            console.log("error");
        });
       
     }
   }    
    });



appModule.factory('socket', function ($rootScope) {
  //var socket = io.connect("http://multitvsolution.com:3000");
  var socket = io.connect("http://localhost:3000");
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

appModule.factory('chatRoomService', function ($rootScope) {
       return{
              chatRoom : function(chatRoomName)
              {
                 var chatRoomData = "chatRoomName="+chatRoomName;     
                 return  $http({
                         method: "POST",
                         url: "/chatRoom",
                         data: chatRoomData,
                         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                   }). success(function(data, status, headers, config) {
                                          return data;
                                          //console.log(data);
                                         // $("#userAccess").val(data.result.id);
                               }).error(function(data, status, headers, config) {
                                      //console.log(data);
                                      return data;
                                   
                                   });                     
                     
              }
              
       }
});
/*Start Follow Unfollow*/
appModule.factory('followUserPost', function ($http) {
       return{
              followUser : function(input)
              {     
                 return  $http({
                         method: "POST",
                         url: "http://multitvsolution.com/multitvfinal/api/user/follow/token/555c89c440634",
                         data: input,
                         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                   }). success(function(data, status, headers, config) {
                                          return data;
                                          //console.log(data);
                                         // $("#userAccess").val(data.result.id);
                               }).error(function(data, status, headers, config) {
                                      //console.log(data);
                                      return data;
                                   
                                   });                     
                     
              }
              
       }
});

/* Follow Unfollow  end*/
/*User DataBase Storage*/
appModule.factory('userSubmission',function($http){
    $http.defaults.useXDomain = true;
    //delete $http.defaults.headers.common['X-Requested-With'];
    //$http.defaults.headers.post["Content-Type"] = "application/json";
       return {
              usersLogin : function(socialDataGoogle){
                     //console.log("==============>");
                     //console.log(socialDataGoogle);
                     var socialDataGoogle = JSON.stringify(socialDataGoogle);
                     var data = {};
                     var devicedetail = JSON.stringify({"make_model" : "model-456","os" : "IOS 8.1","screen_resolution" : "320*568","push_device_token" : "pushTokenID","device_type" : "IPod 3","platform" : "IOS","device_unique_id" : "YTREQWQ757858GHHJDHJ4JJGGHGH454545"});
                     var device_other_detail = JSON.stringify({"os_version" : "OS 8.1.2","network_type" : "wifi","network_provider" : "Airtel"});
                     var data = "social="+socialDataGoogle+"&provider=google&device_other_detail="+device_other_detail+"&devicedetail="+devicedetail;
                     //var data  = JSON.stringify({'social':socialDataGoogle,'provider':'google','device_other_detail':{"os_version" : "OS 8.1.2","network_type" : "wifi","network_provider" : "Airtel"},'devicedetail':{"make_model" : "model-456","os" : "IOS 8.1","screen_resolution" : "320*568","push_device_token" : "pushTokenID","device_type" : "IPod 3","platform" : "IOS","device_unique_id" : "YTREQWQ757858GHHJDHJ4JJGGHGH454545"}});
                     //var data  = JSON.stringify({"social":socialDataGoogle,"provider":"google","device_other_detail":{"os_version" : "OS 8.1.2","network_type" : "wifi","network_provider" : "Airtel"},"devicedetail":{"make_model" : "model-456","os" : "IOS 8.1","screen_resolution" : "320*568","push_device_token" : "pushTokenID","device_type" : "IPod 3","platform" : "IOS","device_unique_id" : "YTREQWQ757858GHHJDHJ4JJGGHGH454545"}});
                 return  $http({
                         method: "POST",
                         url: "http://multitvsolution.com/multitvfinal/api/user/social/token/555c89c440634",
                         data: data,
                         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                   }). success(function(data, status, headers, config) {
                                          return data;
                                          //console.log(data);
                                         // $("#userAccess").val(data.result.id);
                               }).error(function(data, status, headers, config) {
                                      //console.log(data);
                                      return data;
                                   
                                   });               
              },
       }
       });
/*End User Submission*/
/*Chat Insert In  DataBase Storage*/
appModule.factory('chatService',function($http){
       return {
              chatInsert : function(chat){
                     var method = 'POST';
                     var inserturl = 'insertChatModule/';
                 return  $http({
                         method: method,
                         url: inserturl,
                         data: chat,
                         headers: {'Content-Type': 'application/json'}
                                   }). success(function(data, status, headers, config) {
                                          return data;
                                         // $("#userAccess").val(data.result.id);
                               }).error(function(data, status, headers, config) {
                                      return data;
                                   });               
              },
       }
       });
/*End Chat Insert In  DataBase Storage*/
/*Chat get In  DataBase Storage*/
appModule.factory('chatGetService',function($http){
       return {
              chatGet : function(chat){
                     var method = 'GET';
                     var inserturl = 'selectChat/';
                 return  $http({
                         method: method,
                         url: inserturl,
                         data: chat,
                         headers: {'Content-Type': 'application/json'}
                                   }). success(function(data, status, headers, config) {
                                          return data;
                                         // $("#userAccess").val(data.result.id);
                               }).error(function(data, status, headers, config) {
                                      return data;
                                   });    
                     
              },
       }
       });
/*End Chat Insert In  DataBase Storage*/
/*Session set*/
appModule.factory('sessionService',function($http){
       return {
              sessionSetGet : function(data,url,method){
                     //var method = 'POST';
                     //var inserturl = 'sessionSet/';
                 return  $http({
                         method: method,
                         url: url,
                         data: data,
                         headers: {'Content-Type': 'application/json'}
                                   }). success(function(data, status, headers, config) {
                                          return data;
                                         // $("#userAccess").val(data.result.id);
                               }).error(function(data, status, headers, config) {
                                      return data;
                                   });          
              },
       }
       });
/*Session end set*/


appModule.factory('subScibeApi',function($http){
       return {
              subScibeApiCall : function(data,url,method){
                     //var method = 'POST';
                     //var inserturl = 'sessionSet/';
                     //console.log(data);
                 return  $http({
                         method: "POST",
                         url: url,
                         data: data,
                         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                   }). success(function(data, status, headers, config) {
                                          return data;
                                         // $("#userAccess").val(data.result.id);
                               }).error(function(data, status, headers, config) {
                                      return data;
                                   });          
              },
       }
       });




/*Scroll Bottom*/
/*appModule.directive("scrollBottom", function(){
    return {
        link: function(scope, element, attr){
            var $id= $("#" + attr.scrollBottom);
            console.log($id);
                $id.scrollTop($id[0].scrollHeight);
        }
    }
});*/

appModule.directive('schrollBottom', function () {
  return {
    link: function (scope, element) {
      scope.$watchCollection('schrollBottom', function (newValue) {
       // if (newValue)
        //{
              //console.log($(document).height()+"=========>"+$(".chatLi").height());
              var chat = $(".chatLi").height();
              var chat1 = $("#messagesChat").height();
              var ChatEnter = parseInt(chat1) +parseInt(chat);
              //console.log(ChatEnter);
          $("#messagesChat").animate({ scrollTop: ChatEnter }, "fast");
         // $(element).scrollTop($(element)[0].scrollHeight);
        //}
      });
    }
  }
})

/*scroll End Bottom*/
/*------Textarea submit on enter----------*/

appModule.directive('ngEnter', function() {
    return function(scope, element, attrs) {
        element.bind("keydown", function(e) {
            if(e.which === 13) {
                scope.$apply(function(){
                    scope.$eval(attrs.ngEnter, {'e': e});
                });
                e.preventDefault();
            }
        });
    };
});

/*-------End Code Textarea-------*/
/*Subscribed Check*/
appModule.factory('subscribed',function($http){
       return {
              subscribedUser : function(data){
                     //var method = 'POST';
                     //var inserturl = 'sessionSet/';
              var url = "http://www.multitvsolution.com/multitvfinal/api/user/user_subscribed/user_id/"+data.user_id+"/event_id/"+data.event_id+"/token/555c89c440634";
                 return  $http({
                         method: "GET",
                         url: url,
                         headers: {'Content-Type': 'application/json'}
                                   }). success(function(data, status, headers, config) {
                                          return data;
                                         // $("#userAccess").val(data.result.id);
                               }).error(function(data, status, headers, config) {
                                      return data;
                                   });          
              },
       }
       });
/*Subscribed end check*/

/*Subscribed Check*/
appModule.factory('ServersessionDestroy',function($http){
       return {
              sessionDestroy : function(data){
                     //var method = 'POST';
                     //var inserturl = 'sessionSet/';
              var url = "/logout";
                 return  $http({
                         method: "GET",
                         url: url,
                         headers: {'Content-Type': 'application/json'}
                                   }). success(function(data, status, headers, config) {
                                          return data;
                               }).error(function(data, status, headers, config) {
                                      return data;
                                   });          
              },
       }
       });
/*Subscribed end check*/


/*Subscribed Check*/
appModule.factory('watchEvent',function($http){
       return {
              watchEventApi : function(data){
                     //var method = 'POST';
                     //var inserturl = 'sessionSet/';
              var url = "http://multitvsolution.com/multitvfinal/api/events/watch/token/555c89c440634";
                 return  $http({
                         method: "POST",
                         url: url,
                         data: data,
                         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                   }). success(function(data, status, headers, config) {
                                          return data;
                                         // $("#userAccess").val(data.result.id);
                               }).error(function(data, status, headers, config) {
                                      return data;
                                   });          
              },
       }
       });
/*Subscribed end check*/
/*Google Map*/
appModule.factory('geolocation', ['$q','$rootScope','$window','geolocation_msgs',function ($q,$rootScope,$window,geolocation_msgs) {
    return {
      getLocation: function (opts) {
        var deferred = $q.defer();
        if ($window.navigator && $window.navigator.geolocation) {
          $window.navigator.geolocation.getCurrentPosition(function(position){
            $rootScope.$apply(function(){deferred.resolve(position);});
          }, function(error) {
            switch (error.code) {
              case 1:
                $rootScope.$broadcast('error',geolocation_msgs['errors.location.permissionDenied']);
                $rootScope.$apply(function() {
                  deferred.reject(geolocation_msgs['errors.location.permissionDenied']);
                });
                break;
              case 2:
                $rootScope.$broadcast('error',geolocation_msgs['errors.location.positionUnavailable']);
                $rootScope.$apply(function() {
                  deferred.reject(geolocation_msgs['errors.location.positionUnavailable']);
                });
                break;
              case 3:
                $rootScope.$broadcast('error',geolocation_msgs['errors.location.timeout']);
                $rootScope.$apply(function() {
                  deferred.reject(geolocation_msgs['errors.location.timeout']);
                });
                break;
            }
          }, opts);
        }
        else
        {
          $rootScope.$broadcast('error',geolocation_msgs['errors.location.unsupportedBrowser']);
          $rootScope.$apply(function(){deferred.reject(geolocation_msgs['errors.location.unsupportedBrowser']);});
        }
        return deferred.promise;
      }
    };
}]);

/*Google Map End */

/*Subscribed Check*/
appModule.factory('beliveUserList',function($http){
       return {
              beliveUser : function(url){
                 return  $http({
                         method: "GET",
                         url: url,
                         headers: {'Content-Type': 'application/x-www-form-urlencoded'}
                                   }). success(function(data, status, headers, config) {
                                          return data;
                                         // $("#userAccess").val(data.result.id);
                               }).error(function(data, status, headers, config) {
                                      return data;
                                   });          
              },
       }
       });
/*Subscribed end check*/
