import './css/styles.css';
import fetchImages from './fetchImages.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const inputFormNode = document.querySelector('.search-form');
const galleryNode = document.querySelector('.gallery');
const loadBtnNode = document.querySelector('.load-more');
let searchQuery, currentPage;

inputFormNode.addEventListener('submit', event => {
  event.preventDefault();
  searchQuery = event.target.elements.searchQuery.value.trim();
  currentPage = 1;
  galleryNode.textContent = '';
  loadGallery();
});

loadBtnNode.addEventListener('click', event => {
  event.preventDefault();
  loadGallery();
});

function loadGallery() {
  fetchImages(searchQuery, currentPage)
    .then(data => {
      const imagesArray = data.hits;
      const totalPages = Math.ceil(data.totalHits / 40);

      if (!imagesArray.length) {
        loadBtnNode.classList.add('hidden');
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        galleryNode.insertAdjacentHTML(
          'beforeend',
          makeGallery(imagesArray).join('')
        );
        loadBtnNode.classList.remove('hidden');
        inputFormNode.reset();
        new SimpleLightbox('.gallery a').refresh();
        if (currentPage == 1) {
          Notify.success(`Hooray! We found ${data.totalHits} images.`);
        }
        if (currentPage === totalPages) {
          Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
          loadBtnNode.classList.add('hidden');
        }
      }
    })
    .catch(error => console.log(error))
    .finally(() => {
      currentPage += 1;
    });
}

function makeGallery(array) {
  return array.map(el => {
    return `
    <a href="${el.largeImageURL}" class="photo-card">
    <img src="${el.webformatURL}" alt="${el.tags}" loading="lazy" />
    <div class="info">
      <p class="info-item">
        <b>Likes ${el.likes}</b>
      </p>
      <p class="info-item">
        <b>Views ${el.views}</b>
      </p>
      <p class="info-item">
        <b>Comments ${el.comments}</b>
      </p>
      <p class="info-item">
        <b>Downloads ${el.downloads}</b>
      </p>
    </div>
  </a>`;
  });
}
