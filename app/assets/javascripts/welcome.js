// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
// You can use CoffeeScript in this file: http://coffeescript.org/

$(function(){
	_.templateSettings = {
		interpolate: /\{\{\=(.+?)\}\}/g,
		evaluate: /\{\{(.+?)\}\}/g
	};

	SyncApp = {};
	window.SyncApp = SyncApp;
	var BASE_FIREBASE_URL = "https://syncretizzle.firebaseio.com/";
	var baseRef = new Firebase(BASE_FIREBASE_URL);

	//Global pubSub object
	Backbone.pubSub = _.extend({}, Backbone.Events);

	Room = Backbone.Firebase.Model.extend({
		initialize: function(room_id) {
			this.room_id = room_id;
			this.segments = new TextSegmentList({'room_id': this.room_id});
		},
		//Return the url specific to the room
		url: function() {
			return new Firebase(BASE_FIREBASE_URL + "room-" + this.room_id);
		}
	});

	TextSegment = Backbone.Model.extend({
		defaults: function() {
			return {
				text: "",
				votes: 0
			}
		}
	});

	TextSegmentList = Backbone.Firebase.Collection.extend({
		model: TextSegment,
		initialize: function(options) {
			this.room_id = room_id;
		},
		url: function() {
	      return new Firebase(BASE_FIREBASE_URL + "room-" + this.room_id + "/text_segments");
		}
	});

	TextSegmentListContainer = Backbone.View.extend({
		events: {},
		initialize: function(options) {
			this.model = options.model;
			this.segments = options.segments;
			this.template = _.template($("#tpl-text-item").html());
			this.$el = $("#text_boxes");
		},
		render: function() {
			segments.each(function(index, element) {
				var box_selector = "box" + index;
				$(box_selector).html("");
				$(box-selector).html(this.template({text_segment: element}));
			});
		}
	});


	AppContainer = Backbone.View.extend({
		el: "#js-app-container",
		initialize: function(options) {
			this.model = options.model;
			this.fb_text = options.fb_text;
			this.lit_text = options.lit_text;
			this.fbTextSegmentListContainer = new TextSegmentListContainer({'model': this.model, 'segments': this.fb_text});
			this.litTextSegmentListContainer = new TextSegmentListContainer({'model': this.model, 'segments': this.lit_text});
			this.fbTextSegmentListContainer.render();
		},
		render: function() {
			this.textSegmentListContainer.render();
		}
	})

	SyncApp.boot = function(options) {
		this.the_options = options;
		this.fb_text = this.the_options.fb_text;
		this.lit_text = this.the_options.lit_text;
		var that = this;
		this.room = new Room(room_id=this.the_options.room_id);
		this.room.once('sync', function() {
	        var appContainer = new AppContainer({'model': that.room, 
	        	'fb_text': that.fb_text, 'lit_text': that.lit_text});
		});
	}	
});