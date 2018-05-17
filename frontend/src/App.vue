<template>
  <div id="app" style="height: 100%" class="layout">
    <v-app id="vuetify">
    <div class="header">
      <mu-appbar :title="appTitle">
        <mu-icon-button icon="chevron_left" slot="left" @click="onBackButtonClick" v-show="!isRootView && user._id != ''"/>
        <mu-icon-menu v-show="shouldHaveTopRightMenu && !enterEditMode" icon="more_vert" slot="right" @itemClick="onTopRightMenuItemClicked">
          <mu-menu-item v-for="menuItem in topRightMenuSetting" :title="menuItem.title" :value="menuItem"/>
        </mu-icon-menu>
      </mu-appbar>
    </div>
    <div class="content">
      <div class="body">
        <mobile-user-login v-show="!authenticated"></mobile-user-login>
        <!--<mobile-user-day-task v-show="user.id != '' && selectedTab == 'today_task'"></mobile-user-day-task>-->
        <transition name="slide">
          <router-view v-show="user._id != ''"></router-view>
        </transition>
        <div style="height: 100px"/>
      </div>
    </div>
    <div class="footer">
      <mu-paper v-show="user._id != '' && isRootView" class="bottomFixed">
        <mu-bottom-nav :value="selectedTab" @change="handleTabChange">
          <mu-bottom-nav-item value="today_task" title="今日任务" icon="assignment"/>
          <mu-bottom-nav-item value="task_info" title="任务统计" icon="assessment"/>
          <mu-bottom-nav-item value="notification" v-show="totalNewNotification > 0" title="消息通知">
            <mu-badge :content="totalNewNotification" circle secondary>
              <mu-icon value="email"/>
            </mu-badge>
          </mu-bottom-nav-item>
          <mu-bottom-nav-item value="notification" v-show="totalNewNotification <= 0" title="消息通知" icon="email"/>
          <!--<button class="mu-buttom-item" type="button" tabindex="0" style="user-select: none; outline: none; cursor: pointer; -webkit-appearance: none;">-->
            <!--<div class="mu-buttom-item-wrapper">-->
              <!--<div class="mu-ripple-wrapper"></div>-->
              <!--<div style="display:inline-block;position:relative">-->
                <!--<i class="mu-bottom-item-icon mu-icon material-icons">email</i>-->
                <!--<div class="mu-badge mu-badge-circle mu-badge-secondary kinder-badge-float">1</div>-->
              <!--</div>-->
              <!--<span class="mu-bottom-item-text">消息通知</span>-->
            <!--</div>-->
          <!--</button>-->
          <mu-bottom-nav-item value="user_center" title="用户中心" icon="account_box"/>
        </mu-bottom-nav>
      </mu-paper>
      <!--<v-bottom-nav v-show="user._id != '' && isRootView" class="bottomFixed" absolute :value="true" color="transparent">-->
        <!--<v-btn flat color="teal" value="recent">-->
          <!--<span>Recent</span>-->
          <!--<v-icon>history</v-icon>-->
        <!--</v-btn>-->
        <!--<v-btn flat color="teal" value="favorites">-->
          <!--<span>Favorites</span>-->
          <!--<v-icon>favorite</v-icon>-->
        <!--</v-btn>-->
        <!--<v-btn flat color="teal" value="nearby">-->
          <!--<span>Nearby</span>-->
          <!--<v-icon>place</v-icon>-->
        <!--</v-btn>-->
      <!--</v-bottom-nav>-->
      <!--<mu-tabs :value="activeTab" shift @change="handleTabChange">-->
      <!--<mu-tab value="today_task" icon="" title="今日任务"/>-->
      <!--<mu-tab value="task_info" icon="" title="任务统计"/>-->
      <!--<mu-tab value="user_center" icon="" title="用户中心"/>-->
      <!--</mu-tabs>-->
    </div>
    </v-app>
  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  import { GET_CURRENT_USER, GET_ALL_USER_ACCOUNT, GET_ALL_ROLE, GET_ALL_DUTY, GET_ALL_PERMISSION, GET_ALL_PERMISSION_ROLE, GET_ALL_USER_TASK_EXEC_DATA, USER_LOGOUT, GET_NEW_INFORM_COUNT, GET_NEW_DUTY_NOTIFICATION_COUNT } from './store/mutation_types'
  import MobileUserLogin from './components/mobile/mobile_user_login.vue'
  import MobileUserDayTask from './components/mobile/mobile_user_day_task.vue'
  import notificationUtil from './utils/NotificationUtil'
  import store from './store/store'
  import locationUtil from './utils/LocationUtil'

  export default {
    name: 'app',
    components: {
      MobileUserLogin, MobileUserDayTask
    },
    computed: {
      ...mapGetters(['authenticated', 'datePickerOptionsDay', 'datePickerOptionsMonth', 'user', 'appTitle', 'totalNewNotification', 'isRootView', 'shouldHaveTopRightMenu', 'topRightMenuSetting', 'enterEditMode'])
    },
    created: function () {
//      this.user._id = '000001'
//      this.user.role = ['ROLE_0001', 'ROLE_0004']
//      this.user.name = 'zhanghao'
    },
    mounted: function () {
//      var bottomIcons = document.getElementsByClassName('mu-bottom-item-icon')
//      var badgeText1 = '<div style="display:inline-block;position:relative">'
//      var badgeText2 = '<div class="mu-badge mu-badge-circle mu-badge-secondary kinder-badge-float">1</div></div>'
//      if (bottomIcons.length >= 2) {
//        bottomIcons[2].insertAdjacentHTML('beforebegin', badgeText1)
//        bottomIcons[2].insertAdjacentHTML('afterend', badgeText2)
//      }
    },
    data: () => {
      return {
        selectedTab: ''
      }
    },
    watch: {
      user: function () {
        if (this.user._id !== '') {
          this.GET_ALL_PERMISSION_ROLE()
          this.GET_ALL_PERMISSION()
          this.GET_ALL_USER_ACCOUNT()
          this.GET_ALL_ROLE()
          this.GET_ALL_DUTY()
          this.GET_NEW_INFORM_COUNT()
          this.GET_NEW_DUTY_NOTIFICATION_COUNT()
          locationUtil.getLocationImmediately(undefined)
          this.handleTabChange('today_task')
        }
      },
      totalNewNotification: function (val) {
        console.log('&&&&&&& we have new inform &&&&&&&&&&: ' + val)
        var param = {
          id: 1,
          title: '新通知',
          text: '有新通知',
          icon: 'http://3.bp.blogspot.com/-Qdsy-GpempY/UU_BN9LTqSI/AAAAAAAAAMA/LkwLW2yNBJ4/s1600/supersu.png',
          smallIcon: 'res://cordova',
          sound: null,
          badge: 1,
          data: { test: 1 }
        }
//        notificationUtil.scheduleSingle(param)
      },
      topRightMenuSetting: function(val) {

      }
    },
    methods: {
      ...mapActions([GET_CURRENT_USER, GET_ALL_USER_ACCOUNT, GET_ALL_ROLE, GET_ALL_DUTY, GET_ALL_PERMISSION, GET_ALL_PERMISSION_ROLE, GET_ALL_USER_TASK_EXEC_DATA, USER_LOGOUT, GET_NEW_INFORM_COUNT, GET_NEW_DUTY_NOTIFICATION_COUNT]),
      handleTabChange: function (id) {
        this.selectedTab = id
        if (id === 'today_task') {
          this.$router.push({ name: 'userDayTask' })
        } else if (id === 'task_info') {
          this.$router.push({ name: 'allUserTasksStat' })
        } else if (id === 'notification') {
          this.$router.push({ name: 'userMessageCenter' })
        } else if (id === 'user_center') {
          this.$router.push({name: 'userCenter'})
        }
      },
      onBackButtonClick: function () {
        this.$router.go(-1)
      },
      onTopRightMenuItemClicked: function (menuItem) {
        store.dispatch(menuItem.value.action)
      }
    }
  }
</script>
<style>
  .layout{
    /*background-color: rgb(236, 236, 236);*/
    height: 100%;
  }

  .header{
    background-color: #2196f3;
  }

  /*.demo-icon-badge {*/
    /*padding: 12px;*/
    /*margin-right: 16px;*/
  /*}*/

  .logo{
    font-size: 24px;
    color: white;
    display: inline-block;
    padding: 10px 20px;
  }

  .nav{
    display: inline-block;
    width: calc(100% - 150px);
    margin: 0 auto;
  }

  .tab{
    margin: 0 auto;
    width: 400px;
    background-color: rgba(0, 0, 0, 0);
  }

  .content{
    width: 90%;
    margin: 0 auto;
    height: auto;
  }

  .breadcrumb{
    margin: 10px 0;
  }

  .body{
    background-color: white;
    border-radius: 5px;
    height: auto;
  }

  .footer{
    padding: 20px 0;
    text-align: center;
    margin-bottom: 0px;
  }

  .bottomFixed{
    position: fixed;
    width: 100%;
    left: 0;
    bottom: 0;
    z-index:1000;
  }

  .kinder-badge-float{
    position: relative;
    top: -12px;
    right: 16px;
    display:inline-block;
    width: 20px;
    height:20px;
  }

  /*.mu-badge-secondary {*/
    /*width: 15px;*/
    /*height: 15px;*/
    /*top: -10px;*/
    /*right: -10px;*/
    /*font-size: 6px;*/
    /*font-weight: bold;*/
  /*}*/
  /*.bottom_bar_title {*/
  /*color: white;*/
  /*}*/

  .edit_button_container {
    background-color: white;
    display: inline-block;
    width: 100%;
    height: 48px;
    bottom: 0;
    left:0;
    position: fixed;
    white-space: nowrap;
  }

  .edit_button {
    display: inline-block;
    width: 50%;
    height: 100%;
    text-align: center;
    line-height: 48px;
    border-width: thin;
    border-color: black;
    white-space: normal;
  }
  .edit_button_left {
    border-style: solid solid none none;
  }
  .edit_button_right {
    border-style: solid none none none;
  }
</style>
