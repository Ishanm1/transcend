// Environment configurations for meditation sessions
// Each environment includes audio and video assets

export const ENVIRONMENTS = {
  ocean: {
    name: 'Ocean Waves',
    audio: require('../assets/no-copyright-ocean-waves-sound-e.mp3'),
    video: require('../assets/6010489-uhd_2160_3840_25fps.mp4'),
  },
  forest: {
    name: 'Forest Birdsong',
    audio: require('../assets/forest-birdsong.mp3'),
    video: require('../assets/12718440_1080_1920_60fps-2.mp4'),
  },
  none: {
    name: 'None',
    audio: null,
    video: require('../assets/6010489-uhd_2160_3840_25fps.mp4'), // Keep ocean video as default
  }
};

export const ENVIRONMENT_KEYS = Object.keys(ENVIRONMENTS);

export default ENVIRONMENTS;

