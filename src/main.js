import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { getImagesByQuery } from "./js/pixabay-api.js";
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from "./js/render-functions.js";

const searchForm = document.querySelector('.search-form');
const loadMoreBtn = document.querySelector('.load-more-btn');

let currentQuery = '';
let currentPage = 1;
let totalHits = 0;

searchForm.addEventListener('submit', handleSearch);
loadMoreBtn.addEventListener('click', handleLoadMore);

async function handleSearch(event) {
  event.preventDefault();
  
  const queryValue = event.target.elements.searchQuery.value.trim();
  
  if (!queryValue) {
    iziToast.warning({ message: 'Please enter a search query!' });
    return;
  }

  currentQuery = queryValue;
  currentPage = 1;
  
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.error({
        message: 'Sorry, there are no images matching your search query. Please try again!',
      });
      return;
    }

    createGallery(data.hits);
    checkPaginationStatus();
  } catch (error) {
    iziToast.error({ message: `Something went wrong: ${error.message}` });
  } finally {
    hideLoader();
    searchForm.reset();
  }
}

async function handleLoadMore() {
  currentPage += 1;
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(currentQuery, currentPage);
    createGallery(data.hits);
    
    smoothScroll();
    checkPaginationStatus();
  } catch (error) {
    iziToast.error({ message: `Error loading more images: ${error.message}` });
  } finally {
    hideLoader();
  }
}

function checkPaginationStatus() {
  const totalLoadedImages = currentPage * 15;
  
  if (totalLoadedImages >= totalHits) {
    hideLoadMoreButton();
    iziToast.info({
      message: "We're sorry, but you've reached the end of search results.",
      position: 'bottomCenter'
    });
  } else {
    showLoadMoreButton();
  }
}

function smoothScroll() {
  const firstCard = document.querySelector('.gallery-item');
  if (firstCard) {
    const cardHeight = firstCard.getBoundingClientRect().height;
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}
