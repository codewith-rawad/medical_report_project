import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import '../Styles/Gallery.css';

import one from '../assets/xray1.png';
import two from '../assets/xray2.png';
import three from '../assets/xray3.png';
import four from '../assets/xray4.png';
import five from '../assets/xray5.png';
import six from '../assets/xray6.png';

import Background from '../Components/Background';
import contact1 from '../assets/background2.jpg';
import contact2 from '../assets/contact2.jpg';

import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

const Gallery = () => {
    const images = [
        {
          id: 1,
          img: one,
          report: "The chest X-ray appears normal with clear lung fields, no visible opacities, normal heart size, and no signs of fluid accumulation or infection."
        },
        {
          id: 2,
          img: two,
          report: "X-ray shows patchy infiltrates consistent with a mild viral infection. No signs of bacterial consolidation or pleural effusion."
        },
        {
          id: 3,
          img: three,
          report: "The image reveals ground-glass opacities in the lower lung zones, commonly associated with early or mild COVID-19 pneumonia."
        },
        {
          id: 4,
          img: four,
          report: "There are dense opacities in the right middle lobe, suggesting a bacterial pneumonia. Slight elevation of the right diaphragm is also noted."
        },
        {
          id: 5,
          img: five,
          report: "Significant lung opacity noted in the left lower lobe, likely indicating fluid or infection. Further evaluation with CT is recommended."
        },
        {
          id: 6,
          img: six,
          report: "Clear lung fields with no abnormalities. The heart and diaphragm appear normal. No signs of infection or pathology."
        }
      ];
      

  const arry = [contact1, contact2];

  return (
    <div className="slider-container">
      <h1 className="gallery-title">Gallery</h1>
      <div className="container">
        <Swiper
          effect="coverflow"
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={2}
          navigation={true}
          loop={true}
          speed={1000}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 150,
            modifier: 1.2,
            slideShadows: true,
          }}
          pagination={{ clickable: true, dynamicBullets: true }}
          modules={[EffectCoverflow, Pagination, Navigation]}
          className="mySwiper"
        >
          {images.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="slide-card">
                <div className="slide-inner">
                  <div className="slide-front">
                    <img src={slide.img} alt={`Slide ${slide.id}`} />
                  </div>
                  <div className="slide-back" >
                    <p>{slide.report}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <Background images={arry} />
    </div>
  );
};

export default Gallery;
