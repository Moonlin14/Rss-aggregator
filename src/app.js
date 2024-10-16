import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import _ from 'lodash';
import parse from './parser.js';
import view from './view.js';
import resources from './locales/index.js';

const validatorUrl = (url, urlList) => {
  const schema = yup.string().trim().required().url()
    .notOneOf(urlList);
  return schema.validate(url);
};

const getAxiosRespones = (link) => {
  const result = new URL('https://allorigins.hexlet.app/get');
  result.searchParams.set('disableCache', 'true');
  result.searchParams.set('url', link);
  return axios.get(result);
};

const createId = () => (_.uniqueId());

const addFeeds = (state, id, title, description) => {
  state.feeds.push({
    feedId: id,
    feedTitle: title,
    feedDescription: description,
    link: state.rssFrom.inputURL,
  });
};

const addPosts = (state, feedId, posts) => {
  posts.forEach((post) => {
    const newPost = {
      feedID: feedId,
      id: createId(),
      title: post.title,
      description: post.description,
      link: post.link,
    };
    state.posts.push(newPost);
  });
};

const loadNewPosts = (state) => {
  const delay = 5000;
  const promise = state.feeds.map((feed) => getAxiosRespones(feed.link)
    .then((res) => {
      const { posts } = parse(res.data.contents);
      posts.forEach((post) => {
        const isIncludes = state.posts.some((loadedPost) => loadedPost.title === post.title);
        if (!isIncludes) {
          state.posts.unshift({
            id: createId(),
            title: post.title,
            description: post.description,
            link: post.link,
          });
        }
      });
    })
    .catch((err) => {
      console.log(err);
    }));
  Promise.all(promise)
    .finally(() => setTimeout(loadNewPosts, delay, state));
};

const typeError = (error) => {
  switch (error.name) {
    case 'AxiosError':
      return 'Network Error';
    case 'parsingError':
      return 'noRSS';
    default:
      return error.message;
  }
};

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    button: document.querySelector('button[aria-label="add"]'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    feedback: document.querySelector('.feedback'),
    modal: document.querySelector('.modal'),
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalLink: document.querySelector('.full-article'),
  };

  const state = {
    process: {
      processState: 'filling',
      processError: null,
    },
    rssFrom: {
      valid: null,
      inputURL: '',
    },
    feeds: [],
    posts: [],
    uiState: {
      visitedLinks: new Set(),
      modalId: '',
    },
  };

  const defaultLng = 'ru';
  const i18n = i18next.createInstance();
  i18n.init({
    lng: defaultLng,
    debug: false,
    resources,
  })
    .then(() => {
      yup.setLocale({
        mixed: {
          required: () => ({ key: 'feedbackEmpty' }),
          notOneOf: () => ({ key: 'feedbackRepeat' }),
        },
        string: {
          url: () => ({ key: 'feedbackWrongURL' }),
        },
      });

      const watchedState = view(elements, i18n, state);

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = formData.get('url');
        watchedState.rssFrom.inputURL = data;

        const loadedRss = watchedState.feeds.map((feed) => feed.link);

        validatorUrl(watchedState.rssFrom.inputURL, loadedRss)
          .then((validUrl) => {
            watchedState.rssFrom.valid = true;
            watchedState.process.processState = 'request';
            return getAxiosRespones(validUrl);
          })
          .then((response) => {
            const parsedRss = parse(response.data.contents);
            const feedId = createId();
            const title = parsedRss.feed.channelTitle;
            const description = parsedRss.feed.channelDescription;
            addFeeds(watchedState, feedId, title, description);
            addPosts(watchedState, feedId, parsedRss.posts);

            watchedState.process.processState = 'loaded';
            watchedState.rssFrom.inputURL = '';
          })
          .catch((error) => {
            console.log(error);
            watchedState.process.processState = 'error';
            watchedState.rssFrom.valid = false;
            watchedState.process.processError = typeError(error);
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const targetPost = e.target;
        const targetPostId = targetPost.dataset.id;
        watchedState.uiState.visitedLinks.add(targetPostId);
        if (targetPost.tagName === 'BUTTON') {
          watchedState.uiState.modalId = targetPostId;
        }
      });

      loadNewPosts(watchedState);

      const postClosingBtns = document.querySelectorAll('button[data-bs-dismiss="modal"]');
      postClosingBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          watchedState.uiState.modalId = '';
        });
      });
    })
    .catch(() => console.log('i18next instance caused an error'));
};
