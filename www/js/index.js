$(document).ready(function(){
	//This will need to be removed when it's uploaded to phone...
	document.addEventListener('deviceready', onDeviceReady,false);
	checkInternet();
	
	//check the status of the internet every 10 seconds
	setInterval(function(){
		checkInternet();
	}
	
	photocount = localStorage.getItem("photocount");
	if(photocount===null){
		photocount = 0;
		localStorage.setItem("photocount", 0);
	}
	
	batchnumber = localStorage.getItem("batchnumber");
	if(batchnumber===null){
		batchnumber = 0;
		localStorage.setItem("batchnumber", 0);
	}
});

var debugging = false;
var photocount;
var isInternet = false;
var apiURL = "https://photos.jdrcomputers.co.uk/api/api.php";

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

function checkInternet(){
	var data = "action=checkconnection"; 
	var success = false;
	$.ajax({
			url: apiURL,
			data: data,
			dataType: "json",
			type: 'post', 
			error: function(){
					// will fire when timeout is reached
					isInternet = false;
			},
			success: function(response){
				if(response.success){
					isInternet = true;
				}else{
					isInternet = false;
				}
			},
			timeout: 3000 // sets timeout to 3 seconds
	});
}

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
	
	var notes = $('#notes').val();
	var photo = $('#photoid').attr('src');
	
	if(photo=='' && notes==''){
		if(!confirm("You have not taken a picture or typed any notes, are you sure you wish to continue")){
			return;
		}
	}
	
	localStorage.setItem("contact_"+photocount+"_photo", photo);
	localStorage.setItem("contact_"+photocount+"_notes", notes);
	localStorage.setItem("contact_"+photocount+"_uploaded", "0");
	
	photocount++;
	localStorage.setItem("photocount", photocount);
	$('#notes').val('');
	$('#photoid').attr('src', '')
});

function viewPhotos(){
	var html = "";
	html += "<table border='1'><thead><tr><th>Photo</th><th>Details</th><th></th></tr></thead>";
	html += "<tbody>";
	for(var i=0;i<photocount;i++){
		html += "<tr>";
		if(typeof(localStorage.getItem("contact_"+i+"_photo"))!==undefined && localStorage.getItem("contact_"+i+"_photo")!='undefined' && localStorage.getItem("contact_"+i+"_photo")!=''){
			//html += "<td><a id='gotophoto-"+i+"' class='gotophoto'><img height='150' src='"+localStorage.getItem("contact_"+i+"_photo")+"' /></a></td>";
			html += "<td><a class='viewsinglephoto' id='viewsinglephoto-"+i+"'><img height='150' src='"+localStorage.getItem("contact_"+i+"_photo")+"' /></a></td>";
		}else{
			html += "<td></td>";
		}
		html += "<td>"+localStorage.getItem("contact_"+i+"_notes").replace(/\n/g,"<br>")+"</td>";
		html += "<td><a id='gotophotolink-"+i+"' class='gotophoto'><i class='fas fa-edit fa-2x'></i></a></td>";
		html += "</tr>";
	}
	html += "</tbody></table>";
	$('#allcontacts').html(html);
	
	if(debugging){
		var content = "";
		var localStorageSpace = function(){
					var allStrings = '';
					for(var key in window.localStorage){
							if(window.localStorage.hasOwnProperty(key)){
									allStrings += window.localStorage[key];
							}
					}
					return allStrings ? 3 + ((allStrings.length*16)/(8*1024)) + ' KB' : 'Empty (0 KB)';
			};
		content += "<pre>Total size: "+localStorageSpace()+"</pre>";
		for (var i = 0; i < localStorage.length; i++){
			content += "<pre>"+localStorage.key(i)+": "+localStorage.getItem(localStorage.key(i))+"</pre>";
		}
		$('#allstorage').html(content);
	}else{
		$('#pendingblock').hide();
	}
}

function dateWithoutSeconds(date){
	return date.substring(0, date.length - 3);
}

function editNotes(){
	var idtoedit = localStorage.getItem("idtoedit");
	$('#editnotestextarea').val(localStorage.getItem("contact_"+idtoedit+"_notes"));
	$('#singlephoto').attr('src', localStorage.getItem("contact_"+idtoedit+"_photo"));
	
}

$(document).on('click', '.gotophoto', function(e){
	e.preventDefault();
	var id = $(this).attr('id').split("-")[1];
	localStorage.setItem("idtoedit", id);
	window.location='#editnotes';
});

$(document).on('change', '#zoom', function(e){
	var zoom = $(this).val();
	$('#viewsinglephoto').attr('width', zoom+"%");
});

$(document).on('click', '#clearstorage', function(e){
	e.preventDefault();
	photocount = 0;
	viewPhotos();
});

$(document).on('click', '#saveeditednotes', function(e){
	e.preventDefault();
	var idtoedit = localStorage.getItem("idtoedit");
	var notes = $('#editnotestextarea').val();
	localStorage.setItem("contact_"+idtoedit+"_notes", notes);
	window.location = "#viewlist";
});

$(document).on('click', '#singlephoto', function(e){
	e.preventDefault();
	var thisid = localStorage.getItem("idtoedit");
	localStorage.setItem("idtoshow", thisid);
	window.location = "viewphoto.html";
});

$(document).on('click', '.viewsinglephoto', function(e){
	e.preventDefault();
	var thisid = $(this).attr('id').split("-")[1];
	localStorage.setItem("idtoshow", thisid);
	window.location = "viewphoto.html";
	
});

function viewSinglePhoto(){
	var thisid = localStorage.getItem("idtoshow");
	$('#viewsinglephoto').attr('src', localStorage.getItem("contact_"+thisid+"_photo"));
}

function createBatch(){
	var data = "action=createbatch";
	
	if(isInternet){
		//check to see if batch has already been created
		batchset = localStorage.getItem("batch_"+batchnumber+"_set");
		if(batchset===null || batchset!='1'){
			//not been set, set it
			$.ajax({
				url: apiURL,
				data: data,
				dataType: "json",
				type: 'post'
			}).done(function(response){
				if(response.success){
					
					localStorage.setItem("batch_"+batchnumber+"_set", "1");
					localStorage.setItem("batch_"+batchnumber+"_batchid", response.batchid);
					localStorage.setItem("batch_"+batchnumber+"_url", response.url);
					localStorage.setItem("batch_"+batchnumber+"_password", response.password);
					//once set, try to upload photos
					tryToUploadPhotos();
					
				}else{
					$('#feedback').html(response.message);
				}
			});
		}else{
			tryToUploadPhotos();
		}
		
		
	}
}

function tryToUploadPhotos(){
	if(isInternet){
		for(var i=0;i<photocount;i++){
			if(localStorage.getItem("contact_"+i+"_uploaded")=='0'){
				uploadPhoto(i);
				return;
			}
		}
		//if we are here, then everything should have been uploaded
		photocount = 0;
		batchnumber++;
		//redirect to view batches page?
		
	}else{
		//check the internet connection (how are we here if it isn't on already?)
		checkInternet();
		//wait 5 seconds then try again
		setTimeout(tryToUploadPhotos(), 5000);
	}
	
}

function uploadPhoto(photoid){
	if(isInternet){
		
		var batchurl = localStorage.getItem("batch_"+batchnumber+"_url");
		var password = localStorage.getItem("batch_"+batchnumber+"_password");
		var photobase64 = localStorage.getItem("batch_"+batchnumber+"_photo");
		var notes = localStorage.getItem("batch_"+batchnumber+"_notes");
		
		var data = "action=uploadphoto&url="+batchurl+"&password="+password+"&photo="+photo+"&notes=notes";
		
		$.ajax({
			url: apiURL,
			data: data,
			dataType: "json",
			type: 'post'
		}).done(function(response){
			if(response.success){
				
				localStorage.setItem("batch_"+batchnumber+"_uploaded", "1");
				//once uploaded, try to upload the next photo
				tryToUploadPhotos();
				
			}else{
				$('#feedback').html(response.message);
			}
			tryToUploadPhotos();
		}).fail(function(response){
			tryToUploadPhotos();
		});
		
	}else{
		//check the internet connection (how are we here if it isn't on already?)
		checkInternet();
		//wait 5 seconds then try again
		setTimeout(tryToUploadPhotos(), 5000);
	}
}

function viewBatches(){
	var html = "";
	if(batchnumber>0){
		for(var i = 0; i<batchnumber;i++){
			if(localStorage.getItem("batch_"+i+"_uploaded") == "1"){
				html += "<tr>";
				html += "<td><a href='https://photos.jdrcomputers.co.uk/"+localStorage.getItem("batch_"+i+"_url")+"/'>https://photos.jdrcomputers.co.uk/"+localStorage.getItem("batch_"+i+"_url")+"/</a></td>";
				html += "<td>"+localStorage.getItem("batch_"+i+"_password")+"</td>";
				html += "</tr>";
			}
		}
	}else{
		html = "<tr><td colspan='2'>No batches have been uploaded to the website</td></tr>";
	}
	$('#batchbody').html(html);
}

//Page change listener - calls functions to make this readable. NB due to the way the "pages" are loaded we cannot put this inside the document ready function.
//Sham - this and the below are there for expandability, can be used for selective synch so only page relevant data is refreshed.
$(document).on( "pagecontainerchange", function( event, ui ) {

	switch (ui.toPage.prop("id")) {
		case "takephoto":
			break;
		case "editnotes":
			editNotes();
			break;
		case "viewphoto":
			viewSinglePhoto();
			break;
		case "viewlist":
			viewPhotos();
			break;
		case "batchlist":
			viewBatches();
			break;
		default:
			console.log("NO PAGE INIT FUNCTION: "+ui.toPage.prop("id"));
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
