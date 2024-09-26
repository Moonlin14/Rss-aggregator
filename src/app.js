import './styles.scss';
import 'bootstrap';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next'
import _ from 'lodash';

const validatorUrl = (url, urlList) => {
  const schema = yup.string().trim().url().notOneOf(urlList).required();
  return schema.validate(url);
};

const getAxiosRespones = (link) => {
  const result = new Url('https://allorigins.hexlet.app/get');
  result.serchParams.set('disableCache', 'true');
  result.serchParams.set('url', link);
  axios.get(result);
};

const createId = () => (_.uniqueId());

export default () => {
  console.log('hi');
}