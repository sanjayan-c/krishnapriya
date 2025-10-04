import { Card } from 'react-bootstrap';
import { Autoplay, Navigation } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';

// types
import type { Slide } from './types';

type SwiperSliderProps = {
  slides: Slide[];
};

const SwiperSlider = ({ slides }: SwiperSliderProps) => {
  const swiperConfig = {
    loop: true,
    spaceBetween: 24,
    autoplay: { delay: 5000 },
    breakpoints: {
      576: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      992: { slidesPerView: 3 },
    },
    roundLengths: true,
    slidesPerView: 1,
    navigation: { nextEl: '.swiper-custom-next', prevEl: '.swiper-custom-prev' },
  };

  return (
    <Swiper modules={[Navigation, Autoplay]} {...(swiperConfig as any)}>
      {(slides || []).map((slide, index) => (
        <SwiperSlide key={index}>
          <Card className="mb-0 border rounded">
            <Card.Body className="testimonial-body shadow">
              <p className="quotation-mark text-muted mb-0">“</p>
              <p className="fw-normal mb-3 mt-0">{slide.statement}</p>
              <hr />
              <div className="d-flex pt-2 align-items-center">
                <div className="flex-grow-1">
                  <h6 className="m-0">{slide.customer.name}</h6>
                  {slide.customer.designation && (
                    <p className="my-0 text-muted fs-13">{slide.customer.designation}</p>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default SwiperSlider;
