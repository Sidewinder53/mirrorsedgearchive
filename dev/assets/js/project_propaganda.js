var prevVideoId = '';

function showVideo(id) {
  var player = document.getElementById('videoPlayer');
  var videoFile = document.getElementById('videoFile');
  var videoTrack = document.getElementById('videoTrack');
  var videoHelp = document.getElementById('videoHelp');
  var videoListSelection = document.getElementById('video' + id);
  if (player.style.display == 'none') {
    player.style.display = 'inline';
    videoHelp.style.display = 'none';
  }
  if (prevVideoId == document.getElementById('video' + id)) {
    return;
  }
  if (prevVideoId != '') {
    prevVideoId.style.backgroundColor = 'transparent';
    prevVideoId.style.color = 'black';
  }
  var videoId = parseInt(id);
  var videoUrl = getVideoUrl(videoId);
  var trackUrl = getTrackUrl(videoId);
  prevVideoId = document.getElementById('video' + id);
  videoFile.src = videoUrl;
  videoTrack.src = trackUrl;
  videoListSelection.style.backgroundColor = 'black';
  videoListSelection.style.color = 'white';
  player.load();
  player.play();
  player.scrollIntoView();
}

function getVideoUrl(id) {
  switch (id) {
    case 1:
      return '/assets/media/video/project_propaganda/krugerspeech_00.webm';
    case 2:
      return 'https://a.safe.moe/WNkV4.mp4';
    case 3:
      return 'https://my.mixtape.moe/bvjwyg.mp4';
    case 4:
      return 'https://archive.org/download/medgec_trailers/2015%20-%20Hero.mp4';
    case 5:
      return 'https://aww.moe/72u3ms.mp4';
    case 6:
      return 'https://my.mixtape.moe/jgarbp.mp4';
    case 7:
      return 'https://aww.moe/72u3ms.mp4';
    case 8:
      return 'https://my.mixtape.moe/bvjwyg.mp4';
    case 9:
      return 'https://track5.mixtape.moe/fhinlq.mp4';
    case 10:
      return 'https://my.mixtape.moe/jgarbp.mp4';
    case 11:
      return 'https://aww.moe/72u3ms.mp4';
    case 12:
      return 'https://my.mixtape.moe/bvjwyg.mp4';
    case 13:
      return 'https://track5.mixtape.moe/fhinlq.mp4';
    case 14:
      return 'https://my.mixtape.moe/jgarbp.mp4';
    case 15:
      return 'https://aww.moe/72u3ms.mp4';
    case 16:
      return 'https://my.mixtape.moe/bvjwyg.mp4';
    case 17:
      return 'https://my.mixtape.moe/bvjwyg.mp4';
    case 18:
      return '';
    default:
      return 'https://aww.moe/72u3ms.mp4';
  }
}

function getTrackUrl(id) {
  switch (id) {
    case 1:
      return 'subs/aurore1.vtt';
    case 2:
      return 'subs.vtt';
    case 3:
      return 'subs.vtt';
    case 4:
      return 'subs.vtt';
    case 5:
      return 'subs.vtt';
    case 6:
      return 'subs.vtt';
    case 7:
      return 'subs.vtt';
    case 8:
      return 'subs.vtt';
    case 9:
      return 'subs.vtt';
    case 10:
      return 'subs.vtt';
    case 11:
      return 'subs.vtt';
    case 12:
      return 'subs.vtt';
    case 13:
      return 'subs.vtt';
    case 14:
      return 'subs.vtt';
    case 15:
      return 'subs.vtt';
    case 16:
      return 'subs.vtt';
    case 17:
      return 'subs.vtt';
    case 18:
      return 'subs.vtt';
    default:
      return 'subs.vtt';
  }
}
