import onChange from 'on-change';

const successLoad = (elements, i18n) => {
  const { form, input, feedback } = elements;
  feedback.classList.add('text-success');
  feedback.classList.remove('text-danger');
  input.classList.remove('is-invalid');
  const feedbackText = i18n.t('feedbacks.feedbackSuccess');
  feedback.textContent = feedbackText;
  form.reset();
  input.focus();
};

const errorLoad = (elements, i18n, state) => {
  const { input, feedback } = elements;
  if (state.process.processError !== null) {
    feedback.classList.remove('text-success');
    feedback.classList.add('text-danger');
    input.classList.add('is-invalid');
    if (state.process.processError === 'Network Error') {
      feedback.textContent = i18n.t('errors.network');
    } else if (state.process.processError === 'noRSS') {
      feedback.textContent = i18n.t('feedbacks.feedbackNoRSS');
    } else {
      const anotherError = state.process.processError;
      feedback.textContent = i18n.t(`feedbacks.${anotherError.key}`);
    }
  } else {
    feedback.classList.remove('text-danger');
    input.classList.remove('is-invalid');
  }
};

const formProcessState = (elements, i18n, value, state) => {
  const { input, button } = elements;
  switch (value) {
    case 'filling':
      break;
    case 'request':
      input.disabled = true;
      button.disabled = true;
      break;
    case 'error':
      errorLoad(elements, i18n, state);
      input.disabled = false;
      button.disabled = false;
      break;
    case 'loaded':
      successLoad(elements, i18n);
      input.disabled = false;
      button.disabled = false;
      break;
    default:
      throw new Error(`Unknown process state: ${value}`);
  }
};

const buildContainer = (title, elements, i18n, state) => {
  const { posts, feeds } = elements;
  if (title === 'feeds') {
    feeds.textContent = '';
  } else {
    posts.textContent = '';
  }

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');
  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18n.t(title);
  cardBody.append(cardTitle);
  card.append(cardBody);
  elements[title].append(card);
  if (title === 'feeds') {
    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group', 'border-0', 'rounded-0');
    state.feeds.forEach((feed) => {
      const listGroupItem = document.createElement('li');
      listGroupItem.classList.add('list-group-item', 'border-0', 'border-end-0');
      const h3 = document.createElement('h3');
      h3.classList.add('h6', 'm-0');
      h3.textContent = feed.feedTitle;
      const p = document.createElement('p');
      p.classList.add('m-0', 'small', 'text-black-50');
      p.textContent = feed.feedDescription;
      listGroupItem.append(h3);
      listGroupItem.append(p);
      listGroup.append(listGroupItem);
      cardBody.append(listGroup);
    });
  }

  if (title === 'posts') {
    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group', 'border-0', 'rounded-0');
    state.posts.forEach((post) => {
      const listGroupItem = document.createElement('li');
      listGroupItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

      const a = document.createElement('a');
      a.setAttribute('href', post.link);
      if (!state.uiState.visitedLinks.has(post.id)) {
        a.classList.add('fw-bold');
      } else {
        a.classList.add('fw-normal', 'link-secondary');
      }
      a.setAttribute('data-id', post.id);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      a.textContent = post.title;

      const btn = document.createElement('button');
      btn.setAttribute('type', 'button');
      btn.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      btn.setAttribute('data-id', post.id);
      btn.setAttribute('data-bs-toggle', 'modal');
      btn.setAttribute('data-bs-target', '#modal');
      btn.textContent = i18n.t('openBtn');

      listGroupItem.append(a);
      listGroupItem.append(btn);
      listGroup.append(listGroupItem);
      cardBody.append(listGroup);
    });
  }
};

const renderModal = (elements, state) => {
  const {
    modal, modalTitle, modalBody, modalLink,
  } = elements;
  if (state.uiState.modalId !== '') {
    modal.classList.add('show');
    modal.removeAttribute('aria-hidden');
    modal.setAttribute('aria-modal', 'true');
    modal.style.display = 'block';

    const loadedPost = state.posts.find((post) => post.id === state.uiState.modalId);
    modalTitle.textContent = loadedPost.title;
    modalBody.textContent = loadedPost.description;
    modalLink.setAttribute('href', loadedPost.link);
  } else {
    modal.classList.remove('show');
    modal.removeAttribute('aria-modal');
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
  }
};

export default (elements, i18n, state) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'process.processState':
        formProcessState(elements, i18n, value, state);
        break;
      case 'process.processError':
        errorLoad(elements, i18n, state);
        break;
      case 'feeds':
        buildContainer('feeds', elements, i18n, state);
        break;
      case 'posts':
        buildContainer('posts', elements, i18n, state);
        break;
      case 'uiState.modalId':
        renderModal(elements, state);
        break;
      case 'uiState.visitedLinks':
        buildContainer('posts', elements, i18n, state);
        break;
      default:
        break;
    }
  });
  return watchedState;
};
