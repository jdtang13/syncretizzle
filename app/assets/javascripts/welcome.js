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

	//Global pubSub object
	Backbone.pubSub = _.extend({}, Backbone.Events);

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
				votes: [0, 0, 0, 0, 0, 0]
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

	//View for rendering the segment list
	TextSegmentListContainer = Backbone.View.extend({
		events: {
			'click a#upvote_btn': 'handleUpClick',
			'click a#downvote_btn': 'handleDownClick'
		},
		initialize: function(options) {
			this.model = options.model;
			this.list_model = options.list_model;
			this.segments = options.segments;
			this.template = _.template($("#tpl-text-item").html());
			this.$el = $("#text_boxes");
			this.curr_url = BASE_FIREBASE_URL + "room-" + this.model.room_id + "/text_segments/votes/";
		},
		handleUpClick: function(e) {
			var $item = $(e.target).closest("div");
			if($item.hasClass("btn--disabled")) {
				return false;
			}
			$item.addClass("btn--disabled");
			var idName = $item.attr('id');
			var index = parseInt(idName.slice(-1));
			var that = this;
			var votesRef = new Firebase(this.curr_url + index);
			votesRef.transaction(function(data) {
				if(data === parseInt(data, 10)) {
					return data + 1;
				}
			});
		},
		handleDownClick: function(e) {
			var $item = $(e.target).closest("div");
			if($item.hasClass("btn--disabled")) {
				return false;
			}
			var idName = $item.attr('id');
			var index = parseInt(idName.slice(-1));
			var that = this;
			var votesRef = new Firebase(this.curr_url + index);
			votesRef.transaction(function(data) {
				if(data === parseInt(data, 10)) {
					return data - 1;
				}
			});
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
			this.list_model = options.list_model;
			this.fb_text = options.fb_text;
			this.lit_text = options.lit_text;
			this.fbTextSegmentListContainer = new TextSegmentListContainer({'model': this.model, 
				'list_model': this.list_model, 'segments': this.fb_text});
			this.litTextSegmentListContainer = new TextSegmentListContainer({'model': this.model, 
				'list_model': this.list_model,'segments': this.lit_text});
			this.fbTextSegmentListContainer.render();
		},
		render: function() {
			this.fbTextSegmentListContainer.render();
		}
	})

	SyncApp.boot = function(options) {
		this.the_options = options;
		this.fb_text = this.the_options.fb_text;
		this.lit_text = this.the_options.lit_text;
		var that = this;
		this.room = new Room(room_id=this.the_options.room_id);
		this.room.once('sync', function() {
			this.listModel = new TextSegmentList({'room_id': this.room_id, 'model': this.room});
			this.listModel.set({votes: [0, 0, 0, 0, 0, 0]});
	        var appContainer = new AppContainer({'model': that.room, 'list_model': that.listModel,
	        	'fb_text': that.fb_text, 'lit_text': that.lit_text});
		});
	}	
});