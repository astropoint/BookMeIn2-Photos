$(document).ready(function(){
	//This will need to be removed when it's uploaded to phone...
	document.addEventListener('deviceready', onDeviceReady,false);
	
	
});

var photocount = 0;
var agendasort = 'desc';
var loggedIn = false;

var spinner = '<svg class="svg-inline--fa fa-spinner fa-w-16 fa-spin" aria-hidden="true" data-prefix="fas" data-icon="spinner" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z"></path></svg>';

var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var destinationType;
function onDeviceReady(){
		pictureSource=navigator.camera.PictureSourceType;
		destinationType=navigator.camera.DestinationType;
		cordova.getAppVersion.getVersionNumber(function (version) {
				$('.versionnumber').html(version);
		});
}

function showToast(text){
	window.plugins.toast.show(text);
}

$(document).on('click', '.mypage', function(e){
	/*
	 * horrible fudge, the left panel always comes out too far covering part of the page so we
	 * have to check whether the page has been clicked on *unless* it's the menu icon itself
	 */
	if(!$(e.target).hasClass('hamburger_icon') && $('#leftpanel').hasClass('ui-panel-open')){
		$( "#leftpanel" ).panel( "close" );
	} 
});

$(document).on('click', '.menu_link', function(e){
	var clicked = $(this).attr('href');
	var active= $('.ui-page-active').attr('id');
	
	if(clicked=='#'+active){
		$('#leftpanel').panel('close');
	}
});

$(document).on('click', '.goback', function(e){
	window.history.back();
});

$(document).on('click', '#getphotobutton', function(e){

	
	navigator.camera.getPicture(function(imageData){
			//on success
			
			$('#photoid').attr('src', "data:image/jpeg;base64," + imageData);
			//$('#receiptphotodiv').show();
		}, function(message){
			//on fail
			showToast('Get photo failed because: ' + message);
		}, 
		{ 
			quality: 50, 
			destinationType: Camera.DestinationType.DATA_URL
		}); 
});

$(document).on('click', '#save', function(e){
	e.preventDefault();
	
	localStorage.setItem("contact_"+photocount+"_photo", $('#photoid').attr('src'));
	localStorage.setItem("contact_"+photocount+"_notes", $('#notes').val());
	
	photocount++;
	$('#notes').val('');
	$('#photoid').attr('src', '')
});

function viewPhotos(){
	var html = "";
	html += "<table border='1'><thead><tr><th>Photo</th><th>Details</th><th></th></tr></thead>";
	html += "<tbody>";
	for(var i=0;i<photocount;i++){
		html += "<tr>";
		html += "<td><a id='gotophoto-"+i+"' class='gotophoto'><img height='150' src='"+localStorage.getItem("contact_"+i+"_photo")+"' /></a></td>";
		html += "<td>"+localStorage.getItem("contact_"+i+"_notes")+"</td>";
		html += "<td></td>";
		html += "</tr>";
	}
	html += "</tbody></table>";
	$('#allcontacts').html(html);
}

function dateWithoutSeconds(date){
	return date.substring(0, date.length - 3);
}

$(document).on('click', '.gotophoto', function(e){
	e.preventDefault();
	var id = $(this).attr('id').split("-")[1];
	$('#singlephoto').attr('src', localStorage.getItem("contact_"+id+"_photo"));
	window.location='#viewphoto';
});

//Page change listener - calls functions to make this readable. NB due to the way the "pages" are loaded we cannot put this inside the document ready function.
//Sham - this and the below are there for expandability, can be used for selective synch so only page relevant data is refreshed.
$(document).on( "pagecontainerchange", function( event, ui ) {

	switch (ui.toPage.prop("id")) {
		case "takephoto":
			break;
		case "viewlist":
			viewPhotos();
			break;
		default:
			console.log("NO PAGE INIT FUNCTION")
			break;
	}
});

function hide_div(div_id) {   
	document.getElementById(div_id).classList.toggle("hide");
}

function toggle_content(current, alternative) { 
	hide_div(current);
	hide_div(alternative);
}
