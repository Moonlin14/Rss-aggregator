import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next'
import _ from 'lodash';
import parser from './parser'

const validatorUrl = (url, urlList) => {
  const schema = yup.string().url().notOneOf(urlList).required();
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
    title,
    description,
    link: state.rssFrom.inputURL
  });
};

const addPosts = (state, feedId, posts) => {
  posts.forEach((post) => {
    const newPost = {
      feedId,
      id: createId(),
      title: post.title,
      description: post.description,
      link: post.link
    };
    state.posts.push(newPost);
  });
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
  }
  
  const state = {
    process: {
      processState: 'filling',
      processError: null 
    },
    rssFrom: {
      valid: null,
      inputURL: ''
    },
    feeds: [],
    posts: [],
    uiState: {
      visitedLinks: new Set(),
      modalId: ''
    }
  };





  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    getAxiosRespones(e.target.textContent)
    .then((respones) => parser(respones.data.contents))
    .then((parsedData) => {
      const feedId = createId();
      const title = parsedData.feed.title;
      const description = parsedData.feed.description; 
    })
  })



}