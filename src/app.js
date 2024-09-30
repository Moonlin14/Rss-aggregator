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

export default () => {
  const form = document.querySelector('.rss-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    getAxiosRespones(e.target.textContent)
    .then((respones) => console.log(parser(respones.data.contents)));
  })
}