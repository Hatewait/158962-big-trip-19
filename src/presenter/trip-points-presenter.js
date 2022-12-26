import EditPointView from '../view/edit-point-view';
import TripEventList from '../view/trip-event-list';
import TripItemView from '../view/trip-item-view';
import EmptyPointView from '../view/empty-point-view';
import { isEscEvent } from '../utils';
import { render, replace } from '../framework/render.js';
import dayjs from 'dayjs';
import { TEXTS_FOR_EMPTY_SHEET } from '../const';

export default class TripPointsPresenter {
  #eventContainer = null;
  #pointsModel = null;
  #offers = null;
  #destinations = null;
  #tripPoints = [];
  #tripList = new TripEventList();

  constructor({eventContainer, pointsModel}) {
    this.#eventContainer = eventContainer;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#tripPoints = [...this.#pointsModel.points];
    this.#offers = this.#pointsModel.offers;
    this.#destinations = this.#pointsModel.destinations;

    const { emptyPointsList } = TEXTS_FOR_EMPTY_SHEET;
    if (this.#tripPoints.length === 0) {
      return render(new EmptyPointView(emptyPointsList), this.#eventContainer);
    }

    render(this.#tripList, this.#eventContainer);
    const sortedTripPointsByDate = this.#tripPoints.sort((pointA, pointB) => dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom)));
    this.#renderPoints(sortedTripPointsByDate);
  }

  #renderPoints(tripPoints) {
    return tripPoints.forEach((tripPoint) => this.#renderTripPoint(tripPoint, this.#offers, this.#destinations));
  }

  #renderTripPoint(point, offers, destinations) {
    const escKeyDownHandler = (evt) => {
      if (isEscEvent(evt)) {
        evt.preventDefault();
        replaceEditFormToPoint();
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    };

    const pointComponent = new TripItemView({
      point,
      offers,
      destinations,
      onClick: () => {
        replacePointToEditForm();
        document.addEventListener('keydown', escKeyDownHandler);
      }
    });

    const pointEditForm = new EditPointView({
      point,
      offers,
      destinations,
      onFormSubmit: () => {
        replaceEditFormToPoint();
        document.removeEventListener('keydown', escKeyDownHandler);
      },
      onClick: () => {
        replaceEditFormToPoint();
        document.removeEventListener('keydown', escKeyDownHandler);
      }
    });

    function replacePointToEditForm() {
      replace(pointEditForm, pointComponent);
    }

    function replaceEditFormToPoint() {
      replace(pointComponent, pointEditForm);
    }

    render(pointComponent, this.#tripList.element);
  }
}
