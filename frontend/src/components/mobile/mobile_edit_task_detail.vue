<template>
  <div>
    <mu-text-field label="任务名称" v-model="task.name" disabled>
    </mu-text-field>
    <br/>
    <mu-text-field label="任务详情" v-model="taskDescr" multiLine :rows="1" :rowsMax="4" disabled>
    </mu-text-field>
    <br/>
    <mu-text-field label="任务执行时间" v-model="task.executetime" disabled>
    </mu-text-field>
    <br/>
    <mu-text-field label="任务实际完成时间" v-show="task.realendtime !== 0" v-model="task.realendtimeDisplay"
                   disabled>
    </mu-text-field>
    <br/>
    <mu-select-field v-model="task.finish_status" label="任务状态" :disabled="task.userid !== user._id" @change="handleTaskStatusChange">
      <mu-menu-item :value="TASK_STATUS_INPROCESS"   :title="TASK_STATUS.get(TASK_STATUS_INPROCESS)"/>
      <mu-menu-item :value="TASK_STATUS_UNFINISHED"   :title="TASK_STATUS.get(TASK_STATUS_UNFINISHED)"/>
      <mu-menu-item :value="TASK_STATUS_FINISHED"   v-show="task.finish_status === TASK_STATUS_FINISHED" :title="TASK_STATUS.get(TASK_STATUS_FINISHED)"/>
    </mu-select-field>
    <br/>
    <mu-text-field label="未完成原因" v-show="task.finish_status === TASK_STATUS_UNFINISHED" :disabled="user._id !== task.userid" v-model="task.comment" :hintText="commentHint" multiLine :rows="2" :rowsMax="4">
    </mu-text-field>
    <br/>
    <mu-select-field v-model="task.approve_status" v-show="showApprove" label="工作审批" hintText="待审批" :disabled="this.task.userid === this.user._id">
      <mu-menu-item value=0   title="个人原因"/>
      <mu-menu-item value=1   title="工作安排"/>
    </mu-select-field>
    <div v-show="this.user._id === this.task.userid" class="mu-text-field-label">拍照留存</div>
    <div class="gridlist-container">
      <mu-grid-list class="gridlist-inline-demo">
        <mu-grid-tile v-for="tile, index in pictures" :key="index">
          <img name="pics" :src="getPictureUrl(tile)"/>
          <span slot="subTitle">{{getTimeDisplay(tile.createTime)}}</span>
          <mu-icon-button v-show="shouldShowPhotoBtn" icon="clear" slot="action" @click="onRemovePicture(tile)"/>
        </mu-grid-tile>
      </mu-grid-list>
    </div>
    <div style="height: 20px"/>
    <div v-show="shouldShowPhotoBtn">
      <mu-raised-button style="display: inline-block; margin: 12px" @click="onAddPicture" label="添加照片" class="raised-button" backgroundColor="lightblue"/>
      <mu-raised-button style="display: inline-block; margin: 12px" @click="onUploadPictures" label="上传照片" :disabled="!shouldEnableUploadBtn" class="raised-button" :backgroundColor="shouldEnableUploadBtn?'lightblue':'grey'"/>
    </div>
    <br/>
    <div>
      <mu-raised-button style="display: inline-block; margin: 12px" @click="cancelEdit" label="取消" class="raised-button" />
      <mu-raised-button style="display: inline-block; margin: 12px" @click="commitEdit" :label="task.finish_status === TASK_STATUS_INPROCESS ? '完成':'提交'" class="raised-button" backgroundColor="green"/>
    </div>
    <div v-show="isCommitting">
      <div class="v-modal" tabindex="0" style="z-index: 2019; width: 100%; height: 100%"></div>
      <div style="position: absolute; top: 50%; left: 50%; margin-top: -30px; margin-left: -30px">
        <mu-circular-progress style="z-index: 2020" :size="60" :strokeWidth="5"/>
      </div>
    </div>
    <mu-bottom-sheet :open="openActionSheet" @close="closeActionSheet">
      <mu-list @itemClick="closeActionSheet">
        <mu-list-item title="拍照" @click="onAddFromCamera"/>
        <mu-list-item title="从相册里选取" @click="onAddFromAlbum"/>
        <mu-list-item title="取消"/>
      </mu-list>
    </mu-bottom-sheet>
  </div>
</template>
<script>
  import {mapActions, mapGetters} from 'vuex'
  import {CHANGE_APP_TITLE, COMMIT_TASK_EXEC_INFO} from '../../store/mutation_types'
  import {TASK_STATUS_INPROCESS, TASK_STATUS_UNFINISHED, TASK_STATUS_FINISHED, TASK_STATUS} from '../../store/common_defs'
  import dateUtil from '../../utils/DateUtil'
//  import locationUtil from '../../utils/LocationUtil'
  import util from '../../store/utils'
  import FileUtil from '../../utils/FileUtil'
  import Moment from 'moment'
  import ArrayUtil from '../../utils/ArrayUtil'
  import {MessageBox} from 'mint-ui'

  export default {
    components: {},
    name: 'duty_edit_panel',
    methods: {
      tableRowClassName (row, index) {
        return ''
      },
      handleTaskStatusChange (value) {
      },
      commitEdit () {
        var hh = this
        MessageBox.confirm('确定提交?').then(function (action) {
          hh.isCommitting = true
//          hh.getLocation()
          hh.commitInfo(0, 0)
        })
      },
      cancelEdit () {
        var hh = this
        MessageBox.confirm('确定放弃?').then(function (action) {
          hh.$router.go(-1)
        })
      },
      // Baidu location functionalities
      getLocation () {
//        locationUtil.getLocationImmediately(undefined)
      },
      commitInfo (lat, lng) {
        this.task.startofday = dateUtil.getStartOfTheday(this.selectedDay)
        var taskFinishInfo = {}
        taskFinishInfo.taskid = this.task.taskid
        taskFinishInfo.userid = this.task.userid
        taskFinishInfo.startofday = this.task.startofday
        taskFinishInfo.comment = this.task.comment
        taskFinishInfo.approve_status = this.task.approve_status
        taskFinishInfo.approve_user = this.task.approve_user
        taskFinishInfo.locationLat = lat
        taskFinishInfo.locationLng = lng
        taskFinishInfo.finish_status = this.task.finish_status

        taskFinishInfo.starttime = this.task.starttime
        taskFinishInfo.endtime = this.task.endtime
        taskFinishInfo.timeType = this.task.timeType
        taskFinishInfo.pictures = this.pictures
        console.log(taskFinishInfo)
        this.COMMIT_TASK_EXEC_INFO(taskFinishInfo)
        this.isCommitting = false
        this.$router.go(-1)
      },
      onGetLocationError (error) {
        console.log('get location error:')
        console.log(error)
        this.commitInfo(0, 0)
      },
      getTimeDisplay (time) {
        return Moment(time).format('YYYY-MM-DD')
      },
      onUploadPictures () {
        var hh = this
        var needUpload = false
        for (var i=0, len=hh.pictures.length; i<len; i++) {
          if (hh.pictures[i].remoteUri === '') {
            needUpload = true
          }
        }
        if (this.pictures.length === 0 || !needUpload){
          MessageBox.alert('无可上传文件')
          return
        }
        MessageBox.confirm('确定上传?').then(function (action) {
          hh.isCommitting = true
          for (var i=0, len=hh.pictures.length; i<len; i++) {
            if (hh.pictures[i].remoteUri === '') {
              var params = {index: i}
              FileUtil.getCdvFileEntry(hh.pictures[i].localUri, params, hh.uploadOnePicture, hh.onOriginalFilePickFailed)
            }
          }
          hh.isCommitting = false
        })
      },
      uploadOnePicture (fileEntry, argument) {
        console.log('Going to upload a picture: ', fileEntry)
        var hh = this
        var ii = argument.index
        fileEntry.file(function (file) {
          var reader = new FileReader();
          reader.onloadend = function() {
            // Create a blob based on the FileReader "result", which we asked to be retrieved as an ArrayBuffer
            var form = new FormData()
            var blob = new Blob([new Uint8Array(this.result)], { type: "image/png" });
            console.log('new blob', this.result, '$', blob)
            form.append("blob", blob, fileEntry.name)
            var oReq = new XMLHttpRequest();
            oReq.open("POST", hh.upload_uri, true)
            var gg = hh
            var index = ii
            oReq.onload = function () {
              // all done!
              console.log('upload done:', oReq.response)
              var result = JSON.parse(oReq.response)
              if(result.data.status === 0){
                gg.pictures[index].remoteUri = gg.backend_uri + '/' + result.data.fileurl
                console.log('the remote url of uploaded file:', gg.pictures[index].remoteUri)
              }
            };
            // Pass the blob in to XHR's send method
            oReq.send(form);
          };
          // Read the file as an ArrayBuffer
          reader.readAsArrayBuffer(file);
        }, function (err) { console.error('error getting fileentry file!' + err); })
      },
      onAddPicture () {
        if (this.pictures.length >= 6) {
          MessageBox.alert('最多只能添加6张照片')
          return
        }
        this.openActionSheet = true
      },
      onRemovePicture (tile) {
        ArrayUtil.remove(tile, this.pictures)
      },
      isExist (modifyTime, originName){
        for(var i=0, len=this.pictures.length; i < len; i++){
          if(this.pictures[i].originFileName === originName){
            return true
          }
        }
        return false
      },
      getPictureUrl (pic) {
        if (pic.remoteUri !== '') {
          console.log('return remoteURI:', pic.remoteUri)
          return pic.remoteUri
        } else {
          console.log('return localURI:', pic.localUri)
          return pic.localUri
        }
      },
      generatePicName (milliSecond, task) {
        return this.user._id + '_' + task.taskid + '_' + milliSecond + '.jpg'
      },
      setOptions (srcType) {
        var options = {
          // Some common settings are 20, 50, and 100
          quality: 100,
          destinationType: Camera.DestinationType.FILE_URI,
          // In this app, dynamically set the picture source, Camera or photo gallery
          sourceType: srcType,
          encodingType: Camera.EncodingType.JPEG,
          mediaType: Camera.MediaType.PICTURE,
          saveToPhotoAlbum: true,
          allowEdit: false,
          correctOrientation: true  //Corrects Android orientation quirks
        }
        return options;
      },
      onPictureTaken (imageUri) {
        var pos0 = imageUri.lastIndexOf('?')
        var fullFilename = imageUri
        if (pos0 >= 0) {
          fullFilename = imageUri.substr(0, imageUri.lastIndexOf('?'))
        }
        var pos = fullFilename.lastIndexOf('/')
        var path = fullFilename.substr(0, pos)
        var filename = fullFilename.substr(pos + 1);
        FileUtil.getFileEntry(path, filename, this.onOriginalFilePicked, this.onOriginalFilePickFailed)
      },
      onOriginalFilePicked (fileEntry) {
        var hh = this
        fileEntry.getMetadata(function(md){
          var modifyDate = md.modificationTime.getTime()
          var filename = hh.generatePicName(modifyDate, hh.task)
          if(hh.isExist(modifyDate, fileEntry.name)) {
            MessageBox.alert('添加的照片已存在')
            return
          }
          var params = {modifyTime: modifyDate, originFilename: fileEntry.name}
          console.log('before upload file:', params, ', filename:', filename)

          FileUtil.moveFile(fileEntry, cordova.file.externalDataDirectory, filename, params, hh.setPicture)
        }, this.onOriginalFilePickFailed)

      },
      onOriginalFilePickFailed (error) {
        console.error(error)
      },
      setPicture (fileEntry, params) {
        var picture = {}
        picture.localUri = fileEntry.toInternalURL()
        picture.remoteUri = ''
        picture.createTime = params.modifyTime
        picture.originFileName = params.originFilename
        this.pictures.push(picture)
        console.log('get picture object:', picture, this.pictures)
      },
      onAddFromCamera () {
        var srcType = Camera.PictureSourceType.CAMERA;
        var options = this.setOptions(srcType);
        var func = this.onPictureTaken

        navigator.camera.getPicture(function cameraSuccess(imageUri) {
          func(imageUri);

        }, function cameraError(error) {
          console.debug("Unable to obtain picture: " + error, "app");

        }, options);
      },
      onAddFromAlbum () {
        var srcType = Camera.PictureSourceType.PHOTOLIBRARY;
        var options = this.setOptions(srcType);
        var func = this.onPictureTaken;

        navigator.camera.getPicture(function cameraSuccess(imageUri) {
          func(imageUri);
        }, function cameraError(error) {
          console.debug("Unable to obtain picture: " + error, "app");

        }, options);
      },
      closeActionSheet () {
        this.openActionSheet = false
      },
      ...mapActions([COMMIT_TASK_EXEC_INFO, CHANGE_APP_TITLE]),
      getTaskPictures () {
        var task = this.$route.params.task
        if (task.pictures !== undefined){
          this.pictures = ArrayUtil.dup(task.pictures)
        }
      }
    },
    computed: {
      ...mapGetters(['allRole', 'user', 'upload_uri', 'backend_uri']),
      taskDescr () {
        return util.getDutyDescr(this.task.taskid)
      },
      commentHint () {
        if (this.user._id !== this.task.userid) {
          return ''
        } else if (this.task.realendtime === 0) {
          return '按时完成，请直接点击\'完成\'按钮即可'
        } else {
          return '填写未完成原因'
        }
      },
      TASK_STATUS_INPROCESS () {
        return TASK_STATUS_INPROCESS
      },
      TASK_STATUS_UNFINISHED () {
        return TASK_STATUS_UNFINISHED
      },
      TASK_STATUS_FINISHED () {
        return TASK_STATUS_FINISHED
      },
      TASK_STATUS () {
        return TASK_STATUS
      },
      shouldShowPhotoBtn () {
        return this.user._id === this.task.userid
      },
      shouldEnableUploadBtn () {
        var len = this.pictures.length
        if(len === 0){
          return false
        }
        for(var i=0; i<len; i++){
          if(this.pictures[i].remoteUri === ''){
            return true
          }
        }
        return false
      },
    },
    created: function () {
    },
    beforeRouteEnter: function (to, from, next) {
      next(vm => {
        vm.CHANGE_APP_TITLE('员工任务详情')
        vm.getTaskPictures()
      })
    },
    data () {
      return {
        formLabelWidth: '120px',
        labelPosition: 'right',
        selectedRoleName: [],
        task: this.$route.params.task,
        selectedDay: this.$route.params.date,
        showApprove: this.$route.params.showApprove,
        isCommitting: false,
        openActionSheet: false,
        pictures: []
      }
    }
  }
</script>
<style>
  .raised-button {
    margin: 12px;
  }

  .gridlist-container{
    flex-wrap: wrap;
    justify-content: space-around;
  }

  .gridlist-inline-demo{
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    vertical-align: middle;
  }

  .material-icons.enabled_photo_button{
    font-size: 60px;
    color: lightblue;
  }

  .material-icons.disabled_photo_button{
    font-size: 60px;
    color: #c7cdd2;
  }

  div.mu-grid-tile img{
    width: 108px;
    height: 146px;
  }

  .gridlist-inline-demo>div{
    width: 110px;
    height: 148px;
  }

  .gridlist-inline-demo>button.mu-icon-button{
    width: 80px;
    height: 80px;
    padding: 0px;
  }

  .gridlist-inline-demo .mu-grid-tile-titlebar>.mu-grid-tile-action>button.mu-icon-button{
    width: 32px;
    height: 32px;
  }

  .mu-grid-tile-titlebar>.mu-icon-button{
    width: 32px;
    height: 32px;
  }

  .gridlist-inline-demo .mu-grid-tile-title-container{
    margin-left: 3px;
  }

  .gridlist-inline-demo .mu-grid-tile{
    width: 108px;
    height: 146px;
  }
  .gridlist-inline-demo .mu-grid-tile-titlebar{
    width: 108px;
    height: 32px;
  }

  .gridlist-inline-demo>div{
    width: 70px;
    height: 146px;
  }

  .body>div>div.mu-text-field-label{
    color: rgba(0,0,0,.38);
    font-size: 16px;
  }
</style>
