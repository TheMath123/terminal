import ffprobe from '@ffprobe-installer/ffprobe';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfprobePath(ffprobe.path);

export default ffmpeg;
