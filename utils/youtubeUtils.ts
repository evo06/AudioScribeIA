
/**
 * Extracts the video ID from a YouTube URL
 * Supports standard URLs, short URLs (youtu.be), embeds, and Shorts
 */
export const getYoutubeVideoId = (url: string): string | null => {
  // Added 'shorts\/' to the regex capture group
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = url.match(regExp);

  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Returns the thumbnail URL for a video ID
 */
export const getYoutubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};
