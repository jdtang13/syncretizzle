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
				user_status: "Voting on passages ...",
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
			if($item.hasClass("btn--disabled") || up_count === 0) {
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
			var statusRef = new Firebase(this.curr_url + this.user.id + "/user_status/");
			if(down_count === 0 && up_count === 0) {
				Backbone.pubSub.trigger("readyUser");
			}
		},
		handleDownClick: function(e) {
			var $item = $(e.target).closest("li");
			if($item.hasClass("btn--disabled") || down_count === 0) {
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
			this.user_initials = options.initials;
			this.room_id = options.room_id;
				
			this.userListModel = new UserList({'room_id': this.room_id, 'model': this.model});
			this.user = this.userListModel.create({'user_initials': this.user_initials});

			this.textListModel = new TextSegmentList({'room_id': this.room_id, 'model': this.model});

			var disconnectRef = new Firebase(BASE_FIREBASE_URL + "room-" + this.room_id + "/users/" + this.user.id);
			disconnectRef.onDisconnect().remove();
			this.dataTextSegmentListContainer = new TextSegmentListContainer({'model': this.model, 
				'textlist_model': this.textlist_model,'segments': this.data_text, 'user': this.user});
			this.userListContainer = new UserListContainer({'userlist_model': this.userListModel});			
			this.render();
			this.model.on('all', this.renderUsers, this);
			Backbone.pubSub.on("readyUser", this.checkEnd, this);
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
		moveToNextRound: function() {
			alert("MOVING");
		},
		checkEnd: function(statusRef) {
			$(".box").addClass("btn--disabled");
			if(this.checkAllUsersReady()) {
				var that = this;
				var base_votes = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
				$.each(this.userListModel.models, function(index, element) {
					var user_votes = element.attributes.user_votes;
					for(var i = 0; i < user_votes.length; i++) {
						base_votes[i] += user_votes[i];
					}
				});
				console.log(base_votes);
				this.moveToNextRound();
			}
		},
		renderUsers: function() {
			this.userListContainer.render();
		},
		render: function() {
			this.dataTextSegmentListContainer.render();
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
		this.data_text = this.the_options.text;
		this.user_initials = options.user_initials;
		this.round = options.round;
		renderRound(this.round);
		var that = this;
		this.room = new Room(room_id=this.the_options.room_id);
		this.room.once('sync', function() {
	        var appContainer = new AppContainer({'model': that.room, 'textlist_model': that.textListModel,
	        	'data_text': that.data_text, 'initials': that.user_initials,
	        	'room_id': that.the_options.room_id});
		});
	}	
});