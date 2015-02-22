// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://coffeescript.org/

$(function(){
	// _.templateSettings = {
	// 	interpolate: /\{\{\=(.+?)\}\}/g,
	// 	evaluate: /\{\{(.+?)\}\}/g
	// };

	SyncApp = {};
	window.SyncApp = SyncApp;
	var BASE_FIREBASE_URL = "https://syncretizzle.firebaseio.com/";
	var baseRef = new Firebase(BASE_FIREBASE_URL);
	//Global counts
	up_count = 4;
	down_count = 2;

	//Global pubSub object
	Backbone.pubSub = _.extend({}, Backbone.Events);

	User = Backbone.Model.extend({
		defaults: function() {
			return {
				user_initials: "",
				user_status: "Not Ready to Start Game",
				user_votes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			};
		}
	});

	UserList = Backbone.Firebase.Collection.extend({
		model: User,
		initialize: function(options) {
			this.room_id = options.room_id;
		},
		url: function() {
			return new Firebase(BASE_FIREBASE_URL + 
				"room-" + this.room_id + "/users/");
		}
	});

	//Backbone Model, contains room_id and segmentList
	Room = Backbone.Firebase.Model.extend({
		defaults: function() {
			started: false;
		},
		initialize: function(room_id) {
			this.room_id = room_id;
		},
		//Return the url specific to the room
		url: function() {
			return new Firebase(BASE_FIREBASE_URL + "room-" + this.room_id);
		}
	});

	//Segment list, contains vote indices, knows room id and model
	TextSegmentList = Backbone.Firebase.Model.extend({
		el: "#text_boxes",
		defaults: function() {
			return {
				votes: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
			}
		},
		initialize: function(options) {
			this.room_id = room_id;
			this.model = options.model;
		},
		url: function() {
	      return new Firebase(BASE_FIREBASE_URL + "room-" + this.room_id + "/text_segments");
		}
	});

	UserListContainer = Backbone.View.extend({
		initialize: function(options) {
			this.userlist_model = options.userlist_model;
			this.template = _.template($("#tpl-user-item").html());
		},
		render: function() {
			var users = this.userlist_model.models;
			var that = this;
			var $list = $("#right_sidebar ul");
			$list.html("");
			$.each(users, function(index, element) {
				if(element.id)
					$list.append(that.template(element.toJSON()));
			});
		}
	});

	//View for rendering the segment list
	TextSegmentListContainer = Backbone.View.extend({
		events: {
			'click .upvote_btn': 'handleUpClick',
			'click .downvote_btn': 'handleDownClick'
		},
		initialize: function(options) {
			this.model = options.model;
			this.textlist_model = options.textlist_model;
			this.segments = options.segments;
			this.user = options.user;
			this.template = _.template($("#tpl-text-item").html());
			this.$el = $("#text_boxes");
			this.curr_url = BASE_FIREBASE_URL + "room-" + this.model.room_id + "/users/";
		},
		handleUpClick: function(e) {
			var $item = $(e.target).closest("li");
			if(round !== 'final', $item.hasClass("btn--disabled") || up_count === 0) {
				return false;
			}
			$item.addClass("btn--disabled");
			$item.addClass("up_selected");
			up_count--;
			$("#upvote_count").html(up_count);
			var idName = $item.attr('id');
			var index = parseInt(idName.slice(-1));
			var that = this;
			var userRef = new Firebase(this.curr_url + this.user.id);
			userRef.transaction(function(data) {
				vote_value = data.user_votes[index-1];
				if(vote_value === parseInt(vote_value, 10)) {
					data.user_votes[index - 1] = vote_value + 1;
				}
				if(down_count === 0 && up_count === 0) {
					data.user_status = "Ready! ";
				}
				return data;
			});
			if(down_count === 0 && up_count === 0) {
				Backbone.pubSub.trigger("readyUser");
			}
		},
		handleDownClick: function(e) {
			var $item = $(e.target).closest("li");
			if(round !== 'final', $item.hasClass("btn--disabled") || down_count === 0) {
				return false;
			}
			$item.addClass("btn--disabled");
			$item.addClass("down_selected");
			down_count--;
			$("#downvote_count").html(down_count);
			var idName = $item.attr('id');
			var index = parseInt(idName.slice(-1));
			var that = this;
			var userRef = new Firebase(this.curr_url + this.user.id);
			userRef.transaction(function(data) {
				vote_value = data.user_votes[index-1];
				if(vote_value === parseInt(vote_value, 10)) {
					data.user_votes[index - 1] = vote_value - 1;
				}
				if(down_count === 0 && up_count === 0) {
					data.user_status = "Ready! ";
				}
				return data;
			});
			if(down_count === 0 && up_count === 0) {
				Backbone.pubSub.trigger("readyUser");
			}
		},
		render: function() {
			if(this.segments.length === 0) return;
			var that = this;
			$.each(this.segments, function(index, element) {
				var box_selector = "#box" + (index + 1);
				$(box_selector).html("");
				$(box_selector).html(that.template({text_segment: element}));
			});
		}
	});


	//App Container manages rendering
	AppContainer = Backbone.View.extend({
		el: "#js-app-container",
		initialize: function(options) {
			this.model = options.model;
			this.textlist_model = options.textlist_model;
			this.data_text = options.data_text;

			this.fb_arr = options.fb_arr;
			this.lit_arr = options.lit_arr;

			this.user_initials = options.initials;
			this.room_id = options.room_id;
				
			this.userListModel = new UserList({'room_id': this.room_id, 'model': this.model});
			this.user = this.userListModel.create({'user_initials': this.user_initials});

			this.model.set({'host': this.user.id});

			this.textListModel = new TextSegmentList({'room_id': this.room_id, 'model': this.model});
			this.startedRef = new Firebase(BASE_FIREBASE_URL + "room-" + this.room_id + "/started");
			this.allUsersRef = new Firebase(BASE_FIREBASE_URL + "room-" + this.room_id + "/users/");
			this.userRef = new Firebase(BASE_FIREBASE_URL + "room-" + this.room_id + "/users/" + this.user.id);
			this.userRef.onDisconnect().remove();
			this.startedRef.onDisconnect().set(false);

			this.userListContainer = new UserListContainer({'userlist_model': this.userListModel});			

			this.refFBData = new Firebase(BASE_FIREBASE_URL + "room-" + this.room_id + "/users/" + this.user.id + "/fbdata/");
			this.refLitData = new Firebase(BASE_FIREBASE_URL + "room-" + this.room_id + "/users/" + this.user.id + "/litdata/");

			var user = this.userListModel.get(this.user.id);
			var that = this;

			var fb_data = that.fb_arr.map(function(element) {
				return element.content;
			});
			var lit_data = that.lit_arr.map(function(element) {
				return element.content;
			});
			var fb_data_obj = {};
			var lit_data_obj = {};
			for(var i = 0; i < fb_data.length; i++) {
				fb_data_obj[i] = fb_data[i];
			}
			for(var i = 0; i < lit_data.length; i++) {
				lit_data_obj[i] = lit_data[i];
			}
			user.set({'fbdata': 'happy', 'litdata':'happy'});
			user.set({'fbdata': fb_data_obj, 'litdata': lit_data_obj});
			this.render();
			this.model.on('all', this.renderUsers, this);
			Backbone.pubSub.on("readyUser", this.checkEnd, this);
			var that = this;
			$("#ready").click(function() {
				that.userRef.transaction(function(data) {
					data.user_status = "Ready to Start Game";
					return data;
				});
				if(that.checkAllUsersStart()) {
					that.model.set({'started': true});
				}
			});
			this.startedRef.on('value', this.startGame, this);
			this.refRound = new Firebase(BASE_FIREBASE_URL + "room-" + this.room_id + "/round/");
			this.refRound.on('value', this.moveToNextRound, this);
			this.refText = new Firebase(BASE_FIREBASE_URL + "room-" + this.room_id + "/data_text/")
			this.refText.on('value', this.renderText, this);
		},
		startGame: function(snapshot) {
			if(!snapshot.val()) return;
			this.allUsersRef.transaction(function(data) {
				var new_data = {};
				for(key in data) {
					if(data[key].id) {
						data[key].user_status = "Voting on Text Segments ...";
						new_data[key] = data[key];
					}
				}
				return new_data;	
			});
			this.render();
		},
		checkAllUsersStart: function() {
			for(var i = 0; i < this.userListModel.models.length; i++) {
				var element = this.userListModel.models[i];
				if(!element.id) {
					continue;
				}
				if(element.attributes.user_status !== 'Ready to Start Game') {
					return false;
				}
			}
			return true;
		},
		checkAllUsersReady: function() {
			for(var i = 0; i < this.userListModel.models.length; i++) {
				var element = this.userListModel.models[i];
				if(!element.id) {
					continue;
				}
				if(element.attributes.user_status !== 'Ready! ') {
					return false;
				}
			}
			return true;
		},
		moveToNextRound: function(snapshot) {
			if(!snapshot.val()) return;
			if(snapshot.val() === 'fb') {
				return;
			}
			var that = this;
			var base_votes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
			$.each(this.userListModel.models, function(index, element) {
				var user_votes = element.attributes.user_votes;
				for(var i = 0; i < user_votes.length; i++) {
					base_votes[i] += user_votes[i];
				}
			});
			if(snapshot.val() === 'lit') {
				fb_votes = base_votes;
			}
			if(snapshot.val() === 'final') {
				lit_votes = base_votes;
			}
			round = snapshot.val();
			if(round === 'lit') {
				renderRound('lit');
				up_count = 4;
				down_count = 2; 
				$("#upvote_count").html(up_count);
				$("#downvote_count").html(down_count);
				this.allUsersRef.transaction(function(data) {
					var new_data = {};
					for(key in data) {
						if(data[key].id) {
							data[key].user_status = "Voting on Text Segments ...";
							new_data[key] = data[key];
						}
					}
					return new_data;
				});
				this.render();
				$(".btn--disabled").removeClass("btn--disabled");
				$("img").css("display", "");
				$(".up_selected").removeClass("up_selected");
				$(".down_selected").removeClass("down_selected");
			}
		},
		checkEnd: function() {
			$(".box").addClass("btn--disabled");
			if(this.checkAllUsersReady()) {
				if(round === 'fb')
					this.model.set({'round': 'lit'});
				else if(round === 'lit') {
					this.model.set({'round': 'final'})
				}
			}
		},
		renderUsers: function() {
			this.userListContainer.render();
		},
		getRandom: function (arr, n) {
		    var result = new Array(n),
		        len = arr.length,
		        taken = new Array(len);
		    if (n > len)
		        throw new RangeError("getRandom: more elements taken than available");
		    while (n--) {
		        var x = Math.floor(Math.random() * len);
		        result[n] = arr[x in taken ? taken[x] : x];
		        taken[x] = --len;
		    }
		    return result;
		},
		renderText: function(snapshot) {
			if(!snapshot.val()) return;
			$("#waiting").css('display', 'none');
			$("#ready").css('display', 'none');
			this.dataTextSegmentListContainer = new TextSegmentListContainer({'model': this.model, 
				'textlist_model': this.textlist_model,'segments': snapshot.val(), 'user': this.user});
			this.dataTextSegmentListContainer.render();
		},
		render: function() {
			if(this.user.id === this.model.get('host') && this.model.get('started')) {
				var users = this.model.attributes.users;
				var bigfinal = [];
				for(var key in users) {
					if(round === 'fb')
						bigfinal = bigfinal.concat(users[key].fbdata);
					if(round === 'lit')
						bigfinal = bigfinal.concat(users[key].litdata);
				}
				var arr10 = this.getRandom(bigfinal, 10);
				var obj10 = {};
				for(var i =0; i < arr10.length; i++) {
					obj10[i] = arr10[i];
				}
				this.model.set({data_text: obj10});
			}
			this.userListContainer.render();
		}
	})

	renderRound = function(round) {
		if(round === 'fb') {
			$("#round").html("Facebook Round");
		}
		if(round === 'lit') {
			$("#round").html("Literary Round");
		}
	}

	SyncApp.boot = function(options) {
		this.the_options = options;
		this.user_initials = options.user_initials;
		round = options.round;
		this.fb_arr = options.fb_arr;
		this.lit_arr = options.lit_arr;
		renderRound(round);
		var that = this;
		this.room = new Room(room_id=this.the_options.room_id);
		this.room.once('sync', function() {
			if(that.room.get('started') === true) {
				return;
			}
			that.room.set({'started': false});
	        var appContainer = new AppContainer({'model': that.room, 'textlist_model': that.textListModel,
	        	'fb_arr': that.fb_arr, 'lit_arr': that.lit_arr, 'initials': that.user_initials,
	        	'room_id': that.the_options.room_id});
		});
	}	
});