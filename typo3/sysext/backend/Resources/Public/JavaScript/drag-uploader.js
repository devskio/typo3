/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */
import $ from"jquery";import{DateTime}from"luxon";import{SeverityEnum}from"@typo3/backend/enum/severity.js";import{MessageUtility}from"@typo3/backend/utility/message-utility.js";import NProgress from"nprogress";import AjaxRequest from"@typo3/core/ajax/ajax-request.js";import{default as Modal,Sizes as ModalSizes}from"@typo3/backend/modal.js";import Notification from"@typo3/backend/notification.js";import ImmediateAction from"@typo3/backend/action-button/immediate-action.js";import Md5 from"@typo3/backend/hashing/md5.js";import"@typo3/backend/element/icon-element.js";var Action;!function(e){e.OVERRIDE="replace",e.RENAME="rename",e.SKIP="cancel",e.USE_EXISTING="useExisting"}(Action||(Action={}));class DragUploaderPlugin{constructor(e){this.askForOverride=[],this.percentagePerFile=1,this.hideDropzone=e=>{e.stopPropagation(),e.preventDefault(),this.$dropzone.hide(),this.$dropzone.removeClass("drop-status-ok"),this.manuallyTriggered=!1},this.dragFileIntoDocument=e=>(e.stopPropagation(),e.preventDefault(),$(e.currentTarget).addClass("drop-in-progress"),this.$element.get(0)?.offsetParent&&this.showDropzone(),!1),this.dragAborted=e=>(e.stopPropagation(),e.preventDefault(),$(e.currentTarget).removeClass("drop-in-progress"),!1),this.ignoreDrop=e=>(e.stopPropagation(),e.preventDefault(),this.dragAborted(e),!1),this.handleDrop=e=>{this.ignoreDrop(e),this.hideDropzone(e),this.processFiles(e.originalEvent.dataTransfer.files)},this.fileInDropzone=()=>{this.$dropzone.addClass("drop-status-ok")},this.fileOutOfDropzone=()=>{this.$dropzone.removeClass("drop-status-ok"),this.manuallyTriggered||this.manualTable||this.$dropzone.hide()},this.$body=$("body"),this.$element=$(e);const t=void 0!==this.$element.data("dropzoneTrigger");this.$trigger=$(this.$element.data("dropzoneTrigger")),this.defaultAction=this.$element.data("defaultAction")||Action.SKIP,this.$dropzone=$("<div />").addClass("dropzone").hide(),this.irreObjectUid=this.$element.data("fileIrreObject");const i=this.$element.data("dropzoneTarget");this.irreObjectUid&&0!==this.$element.nextAll(i).length?(this.dropZoneInsertBefore=!0,this.$dropzone.insertBefore(i)):(this.dropZoneInsertBefore=!1,this.$dropzone.insertAfter(i)),this.$dropzoneMask=$("<div />").addClass("dropzone-mask").appendTo(this.$dropzone),this.fileInput=document.createElement("input"),this.fileInput.setAttribute("type","file"),this.fileInput.setAttribute("multiple","multiple"),this.fileInput.setAttribute("name","files[]"),this.fileInput.classList.add("upload-file-picker"),this.$body.append(this.fileInput),this.$fileList=$(this.$element.data("progress-container")),this.fileListColumnCount=$("thead tr:first th",this.$fileList).length+1,this.filesExtensionsAllowed=this.$element.data("file-allowed"),this.fileDenyPattern=this.$element.data("file-deny-pattern")?new RegExp(this.$element.data("file-deny-pattern"),"i"):null,this.maxFileSize=parseInt(this.$element.data("max-file-size"),10),this.target=this.$element.data("target-folder"),this.reloadUrl=this.$element.data("reload-url"),this.browserCapabilities={fileReader:"undefined"!=typeof FileReader,DnD:"draggable"in document.createElement("span"),Progress:"upload"in new XMLHttpRequest},this.browserCapabilities.DnD?(this.$body.on("dragover",this.dragFileIntoDocument),this.$body.on("dragend",this.dragAborted),this.$body.on("drop",this.ignoreDrop),this.$dropzone.on("dragenter",this.fileInDropzone),this.$dropzoneMask.on("dragenter",this.fileInDropzone),this.$dropzoneMask.on("dragleave",this.fileOutOfDropzone),this.$dropzoneMask.on("drop",(e=>this.handleDrop(e))),this.$dropzone.prepend('<button type="button" class="dropzone-hint" aria-labelledby="dropzone-title"><div class="dropzone-hint-media"><div class="dropzone-hint-icon"></div></div><div class="dropzone-hint-body"><h3 id="dropzone-title" class="dropzone-hint-title">'+TYPO3.lang["file_upload.dropzonehint.title"]+'</h3><p class="dropzone-hint-message">'+TYPO3.lang["file_upload.dropzonehint.message"]+"</p></div></div>").on("click",(()=>{this.fileInput.click()})),$('<button type="button" />').addClass("dropzone-close").attr("aria-label",TYPO3.lang["file_upload.dropzone.close"]).on("click",this.hideDropzone).appendTo(this.$dropzone),0===this.$fileList.length&&(this.$fileList=$("<table />").attr("id","typo3-filelist").addClass("table table-striped table-hover upload-queue").html("<tbody></tbody>").hide(),this.dropZoneInsertBefore?this.$fileList.insertAfter(this.$dropzone):this.$fileList.insertBefore(this.$dropzone),this.fileListColumnCount=8,this.manualTable=!0),this.fileInput.addEventListener("change",(e=>{this.hideDropzone(e),this.processFiles(Array.apply(null,this.fileInput.files))})),document.addEventListener("keydown",(e=>{"Escape"===e.code&&this.$dropzone.is(":visible")&&!this.manualTable&&this.hideDropzone(e)})),this.bindUploadButton(!0===t?this.$trigger:this.$element)):console.warn("Browser has no Drag and drop capabilities; cannot initialize DragUploader")}showDropzone(){this.$dropzone.show()}processFiles(e){this.queueLength=e.length,this.$fileList.is(":visible")||(this.$fileList.show(),this.$fileList.closest(".t3-filelist-table-container")?.removeClass("hidden"),this.$fileList.closest("form")?.find(".t3-filelist-info-container")?.hide()),NProgress.start(),this.percentagePerFile=1/e.length;const t=[];Array.from(e).forEach((e=>{const i=new AjaxRequest(TYPO3.settings.ajaxUrls.file_exists).withQueryArguments({fileName:e.name,fileTarget:this.target}).get({cache:"no-cache"}).then((async t=>{const i=await t.resolve();void 0!==i.uid?(this.askForOverride.push({original:i,uploaded:e,action:this.irreObjectUid?Action.USE_EXISTING:this.defaultAction}),NProgress.inc(this.percentagePerFile)):new FileQueueItem(this,e,Action.SKIP)}));t.push(i)})),Promise.all(t).then((()=>{this.drawOverrideModal(),NProgress.done()})),this.fileInput.value=""}bindUploadButton(e){e.on("click",(e=>{e.preventDefault(),this.fileInput.click(),this.showDropzone(),this.manuallyTriggered=!0}))}decrementQueueLength(e){if(this.queueLength>0&&(this.queueLength--,0===this.queueLength)){const t=e&&e.length?5e3:0;if(t)for(let t of e)Notification.showMessage(t.title,t.message,t.severity);this.reloadUrl&&!this.manualTable&&setTimeout((()=>{Notification.info(TYPO3.lang["file_upload.reload.filelist"],TYPO3.lang["file_upload.reload.filelist.message"],10,[{label:TYPO3.lang["file_upload.reload.filelist.actions.dismiss"]},{label:TYPO3.lang["file_upload.reload.filelist.actions.reload"],action:new ImmediateAction((()=>{top.list_frame.document.location.href=this.reloadUrl}))}])}),t)}}drawOverrideModal(){const e=Object.keys(this.askForOverride).length;if(0===e)return;const t=$("<div/>").append($("<p/>").text(TYPO3.lang["file_upload.existingfiles.description"]),$("<table/>",{class:"table"}).append($("<thead/>").append($("<tr />").append($("<th/>"),$("<th/>").text(TYPO3.lang["file_upload.header.originalFile"]),$("<th/>").text(TYPO3.lang["file_upload.header.uploadedFile"]),$("<th/>").text(TYPO3.lang["file_upload.header.action"])))));for(let i=0;i<e;++i){const e=$("<tr />").append($("<td />").append(""!==this.askForOverride[i].original.thumbUrl?$("<img />",{src:this.askForOverride[i].original.thumbUrl,height:40}):$(this.askForOverride[i].original.icon)),$("<td />").html(this.askForOverride[i].original.name+" ("+DragUploader.fileSizeAsString(this.askForOverride[i].original.size)+")<br>"+DateTime.fromSeconds(this.askForOverride[i].original.mtime).toLocaleString(DateTime.DATETIME_MED)),$("<td />").html(this.askForOverride[i].uploaded.name+" ("+DragUploader.fileSizeAsString(this.askForOverride[i].uploaded.size)+")<br>"+DateTime.fromMillis(this.askForOverride[i].uploaded.lastModified).toLocaleString(DateTime.DATETIME_MED)),$("<td />").append($("<select />",{class:"form-select t3js-actions","data-override":i}).append(this.irreObjectUid?$("<option/>").val(Action.USE_EXISTING).text(TYPO3.lang["file_upload.actions.use_existing"]):"",$("<option />",{selected:this.defaultAction===Action.SKIP}).val(Action.SKIP).text(TYPO3.lang["file_upload.actions.skip"]),$("<option />",{selected:this.defaultAction===Action.RENAME}).val(Action.RENAME).text(TYPO3.lang["file_upload.actions.rename"]),$("<option />",{selected:this.defaultAction===Action.OVERRIDE}).val(Action.OVERRIDE).text(TYPO3.lang["file_upload.actions.override"]))));t.find("table").append("<tbody />").append(e)}const i=Modal.advanced({title:TYPO3.lang["file_upload.existingfiles.title"],content:t,severity:SeverityEnum.warning,buttons:[{text:$(this).data("button-close-text")||TYPO3.lang["file_upload.button.cancel"]||"Cancel",active:!0,btnClass:"btn-default",name:"cancel"},{text:$(this).data("button-ok-text")||TYPO3.lang["file_upload.button.continue"]||"Continue with selected actions",btnClass:"btn-warning",name:"continue"}],additionalCssClasses:["modal-inner-scroll"],size:ModalSizes.large,callback:e=>{$(e).find(".modal-footer").prepend($("<span/>").addClass("form-inline").append($("<label/>").text(TYPO3.lang["file_upload.actions.all.label"]),$("<select/>",{class:"form-select t3js-actions-all"}).append($("<option/>").val("").text(TYPO3.lang["file_upload.actions.all.empty"]),this.irreObjectUid?$("<option/>").val(Action.USE_EXISTING).text(TYPO3.lang["file_upload.actions.all.use_existing"]):"",$("<option/>",{selected:this.defaultAction===Action.SKIP}).val(Action.SKIP).text(TYPO3.lang["file_upload.actions.all.skip"]),$("<option/>",{selected:this.defaultAction===Action.RENAME}).val(Action.RENAME).text(TYPO3.lang["file_upload.actions.all.rename"]),$("<option/>",{selected:this.defaultAction===Action.OVERRIDE}).val(Action.OVERRIDE).text(TYPO3.lang["file_upload.actions.all.override"]))))}}),s=this,o=$(i);o.on("change",".t3js-actions-all",(function(){const e=$(this).val();""!==e?o.find(".t3js-actions").each(((t,i)=>{const o=$(i),a=parseInt(o.data("override"),10);o.val(e).prop("disabled","disabled"),s.askForOverride[a].action=o.val()})):o.find(".t3js-actions").removeProp("disabled")})),o.on("change",".t3js-actions",(function(){const e=$(this),t=parseInt(e.data("override"),10);s.askForOverride[t].action=e.val()})),i.addEventListener("button.clicked",(function(e){const t=e.target;"cancel"===t.name?(s.askForOverride=[],Modal.dismiss()):"continue"===t.name&&($.each(s.askForOverride,((e,t)=>{t.action===Action.USE_EXISTING?DragUploader.addFileToIrre(s.irreObjectUid,t.original):t.action!==Action.SKIP&&new FileQueueItem(s,t.uploaded,t.action)})),s.askForOverride=[],i.hideModal())})),i.addEventListener("typo3-modal-hidden",(()=>{this.askForOverride=[]}))}}class FileQueueItem{constructor(e,t,i){if(this.dragUploader=e,this.file=t,this.override=i,this.$row=$("<tr />").addClass("upload-queue-item uploading"),this.dragUploader.manualTable||(this.$selector=$("<td />").addClass("col-selector").appendTo(this.$row)),this.$iconCol=$("<td />").addClass("col-icon").appendTo(this.$row),this.$fileName=$("<td />").text(t.name).appendTo(this.$row),this.$progress=$("<td />").attr("colspan",this.dragUploader.fileListColumnCount-this.$row.find("td").length).appendTo(this.$row),this.$progressContainer=$("<div />").addClass("upload-queue-progress").appendTo(this.$progress),this.$progressBar=$("<div />").addClass("upload-queue-progress-bar").appendTo(this.$progressContainer),this.$progressPercentage=$("<span />").addClass("upload-queue-progress-percentage").appendTo(this.$progressContainer),this.$progressMessage=$("<span />").addClass("upload-queue-progress-message").appendTo(this.$progressContainer),0===$("tbody tr.upload-queue-item",this.dragUploader.$fileList).length?(this.$row.prependTo($("tbody",this.dragUploader.$fileList)),this.$row.addClass("last")):this.$row.insertBefore($("tbody tr.upload-queue-item:first",this.dragUploader.$fileList)),this.$selector&&this.$selector.html('<span class="form-check form-toggle"><input type="checkbox" class="form-check-input t3js-multi-record-selection-check" disabled/></span>'),this.$iconCol.html('<typo3-backend-icon identifier="mimetypes-other-other" />'),this.dragUploader.maxFileSize>0&&this.file.size>this.dragUploader.maxFileSize)this.updateMessage(TYPO3.lang["file_upload.maxFileSizeExceeded"].replace(/\{0\}/g,this.file.name).replace(/\{1\}/g,DragUploader.fileSizeAsString(this.dragUploader.maxFileSize))),this.$row.addClass("error");else if(this.dragUploader.fileDenyPattern&&this.file.name.match(this.dragUploader.fileDenyPattern))this.updateMessage(TYPO3.lang["file_upload.fileNotAllowed"].replace(/\{0\}/g,this.file.name)),this.$row.addClass("error");else if(this.checkAllowedExtensions()){this.updateMessage("- "+DragUploader.fileSizeAsString(this.file.size));const e=new FormData;e.append("data[upload][1][target]",this.dragUploader.target),e.append("data[upload][1][data]","1"),e.append("overwriteExistingFiles",this.override),e.append("redirect",""),e.append("upload_1",this.file);const t=new XMLHttpRequest;t.onreadystatechange=()=>{if(t.readyState===XMLHttpRequest.DONE)if(200===t.status)try{const e=JSON.parse(t.responseText);e.hasErrors?this.uploadError(t):this.uploadSuccess(e)}catch(e){this.uploadError(t)}else this.uploadError(t)},t.upload.addEventListener("progress",(e=>this.updateProgress(e))),t.open("POST",TYPO3.settings.ajaxUrls.file_process),t.send(e)}else this.updateMessage(TYPO3.lang["file_upload.fileExtensionExpected"].replace(/\{0\}/g,this.dragUploader.filesExtensionsAllowed)),this.$row.addClass("error")}updateMessage(e){this.$progressMessage.text(e)}removeProgress(){this.$progress&&this.$progress.remove()}uploadStart(){this.$progressPercentage.text("(0%)"),this.$progressBar.width("1%"),this.dragUploader.$trigger.trigger("uploadStart",[this])}uploadError(e){const t=TYPO3.lang["file_upload.uploadFailed"].replace(/\{0\}/g,this.file.name);this.updateMessage(t);try{const t=JSON.parse(e.responseText).messages;if(this.$progressPercentage.text(""),t&&t.length)for(let e of t)Notification.showMessage(e.title,e.message,e.severity,10)}catch(e){}this.$row.addClass("error"),this.dragUploader.decrementQueueLength(),this.dragUploader.$trigger.trigger("uploadError",[this,e])}updateProgress(e){const t=Math.round(e.loaded/e.total*100)+"%";this.$progressBar.outerWidth(t),this.$progressPercentage.text(t),this.dragUploader.$trigger.trigger("updateProgress",[this,t,e])}uploadSuccess(e){if(e.upload){this.dragUploader.decrementQueueLength(e.messages),this.$row.removeClass("uploading"),this.$row.prop("data-type","file"),this.$row.prop("data-file-uid",e.upload[0].uid),this.$fileName.text(e.upload[0].name),this.$progressPercentage.text(""),this.$progressMessage.text("100%"),this.$progressBar.outerWidth("100%");const t=String(e.upload[0].id);if(this.$selector){const e=this.$selector.find("input")?.get(0);e&&(e.removeAttribute("disabled"),e.setAttribute("name","CBC[_FILE|"+Md5.hash(t)+"]"),e.setAttribute("value",t))}e.upload[0].icon&&this.$iconCol.html('<a href="#" data-contextmenu-trigger="click" data-contextmenu-uid="'+t+'" data-contextmenu-table="sys_file">'+e.upload[0].icon+"&nbsp;</span></a>"),this.dragUploader.irreObjectUid?(DragUploader.addFileToIrre(this.dragUploader.irreObjectUid,e.upload[0]),setTimeout((()=>{this.$row.remove(),0===$("tr",this.dragUploader.$fileList).length&&(this.dragUploader.$fileList.hide(),this.dragUploader.$fileList.closest(".t3-filelist-table-container")?.addClass("hidden"),this.dragUploader.$trigger.trigger("uploadSuccess",[this,e]))}),3e3)):setTimeout((()=>{this.showFileInfo(e.upload[0]),this.dragUploader.$trigger.trigger("uploadSuccess",[this,e])}),3e3)}}showFileInfo(e){this.removeProgress(),document.querySelector("#search_field")?.value&&$("<td />").text(e.path).appendTo(this.$row),$("<td />").text("").appendTo(this.$row),$("<td />").text(TYPO3.lang["type.file"]+" ("+e.extension.toUpperCase()+")").appendTo(this.$row),$("<td />").text(DragUploader.fileSizeAsString(e.size)).appendTo(this.$row);let t="";e.permissions.read&&(t+='<strong class="text-danger">'+TYPO3.lang["permissions.read"]+"</strong>"),e.permissions.write&&(t+='<strong class="text-danger">'+TYPO3.lang["permissions.write"]+"</strong>"),$("<td />").html(t).appendTo(this.$row),$("<td />").text("-").appendTo(this.$row);for(let e=this.$row.find("td").length;e<this.dragUploader.fileListColumnCount;e++)$("<td />").text("").appendTo(this.$row)}checkAllowedExtensions(){if(!this.dragUploader.filesExtensionsAllowed)return!0;const e=this.file.name.split(".").pop(),t=this.dragUploader.filesExtensionsAllowed.split(",");return-1!==$.inArray(e.toLowerCase(),t)}}class DragUploader{static fileSizeAsString(e){const t=e/1024;let i="";return i=t>1024?(t/1024).toFixed(1)+" MB":t.toFixed(1)+" KB",i}static addFileToIrre(e,t){const i={actionName:"typo3:foreignRelation:insert",objectGroup:e,table:"sys_file",uid:t.uid};MessageUtility.send(i)}static init(){const e=this.options;$.fn.extend({dragUploader:function(e){return this.each(((t,i)=>{const s=$(i);let o=s.data("DragUploaderPlugin");o||s.data("DragUploaderPlugin",o=new DragUploaderPlugin(i)),"string"==typeof e&&o[e]()}))}}),$((()=>{$(".t3js-drag-uploader").dragUploader(e)}));new MutationObserver((()=>{$(".t3js-drag-uploader").dragUploader(e)})).observe(document,{childList:!0,subtree:!0})}}export const initialize=function(){DragUploader.init(),void 0!==TYPO3.settings&&void 0!==TYPO3.settings.RequireJS&&void 0!==TYPO3.settings.RequireJS.PostInitializationModules&&void 0!==TYPO3.settings.RequireJS.PostInitializationModules["TYPO3/CMS/Backend/DragUploader"]&&$.each(TYPO3.settings.RequireJS.PostInitializationModules["TYPO3/CMS/Backend/DragUploader"],((e,t)=>{window.require([t])}))};DragUploader.init(),void 0!==TYPO3.settings&&void 0!==TYPO3.settings.RequireJS&&void 0!==TYPO3.settings.RequireJS.PostInitializationModules&&void 0!==TYPO3.settings.RequireJS.PostInitializationModules["TYPO3/CMS/Backend/DragUploader"]&&$.each(TYPO3.settings.RequireJS.PostInitializationModules["TYPO3/CMS/Backend/DragUploader"],((e,t)=>{window.require([t])}));