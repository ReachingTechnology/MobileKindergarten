/**
 * Created by HOZ on 13/12/2017.
 */
import store from '../store/store'
var locationUtil = {
  getLocationPeriodically: function (timeInterval) {
    setTimeout(function () {
      console.log('get location periodically!')
      if (store.state.user._id !== '') {
        baidumap_location.getCurrentPosition(function (result) {
          console.log('get location result', result)
          if (result.latitude === NaN || result.longitude === NaN || (result.latitude < 1 && result.longitude < 1)) {
            console.log('get location failed: ', result.locType)
            return
          }
          locationUtil.commitLocInfo(result.latitude, result.longitude)}, locationUtil.onGetLocationError)
      }
      locationUtil.getLocationPeriodically(timeInterval)
    }, timeInterval)
  },
  getLocationImmediately: function (callback) {
    var succeedCallback = callback
    if (callback === undefined) {
      succeedCallback = locationUtil.commitLocInfo
    }

    console.log('get location immediately!')
    if (store.state.user._id !== '') {
      baidumap_location.getCurrentPosition(function (result) {
        console.log('get location result', result)
        if (result.latitude === NaN || result.longitude === NaN || (result.latitude < 1 && result.longitude < 1)) {
          console.log('get location failed: ', result.locType)
          return
        }
        succeedCallback(result.latitude, result.longitude)
      }, locationUtil.onGetLocationError)
      // navigator.geolocation.getCurrentPosition(locationUtil.translateLoc, locationUtil.onGetLocationError, {
      //   timeout: 10000,
      //   enableHighAccuracy: false
      // })
    }
  },
  // translateLoc: function (position) {
  //   console.log('get location succeed', position)
  //   var currentLat = position.coords.latitude
  //   var currentLng = position.coords.longitude
  //   var gpsPoint = new BMap.Point(currentLng, currentLat)
  //   BMap.Convertor.translate(gpsPoint, 0, locationUtil.setBaiduPoint)
  // },

  commitLocInfo: function (lat, lng) {
    console.log('$$$$$$$$$ this is baidu point $$$$$$$$$$$$')
    console.log(lat, lng)
    if (store.state.user._id !== '') {
      var param = {}
      param.user_id = store.state.user._id
      param.locationLat = lat
      param.locationLng = lng
      store.dispatch('UPSERT_USER_LOCATION', param)
    }
  },
  onGetLocationError: function (error) {
    console.log('get location error:')
    console.log(error)
  }
}

export default locationUtil

