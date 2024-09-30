export default (responesData) => {
const parser = new DOMParser();
const xmlDocument = parser.parseFromString(responesData, 'text/xml');
const parserError = xmlDocument.querySelector('parsererror');

if (parserError) {
const err = new Error(parserError.textContent);
err.name = 'parsingError';
throw err;
} else {
  const channel = xmlDocument.querySelector('channel');
  const feedTitle = channel.querySelector('title').textContent;
  const feedDescription = channel.querySelector('description').textContent;
  const feed = { title: feedTitle, description: feedDescription };

  const items = channel.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    
    return { title, description, link };
  });
  return { feed, posts };
};
};