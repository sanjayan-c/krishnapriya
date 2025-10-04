import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Col, Container, Row } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';

// components
import SwiperSlider from 'components/sliders/SwiperSlider';
import Loading from 'components/Loading';

// types
import type { Slide } from 'components/sliders/types';

type APITestimonial = {
  _id: string;
  description: string;
  name: string;
  position?: string;
  updatedAt?: string;
  createdAt?: string;
};

const Testimonials = () => {
  const baseUrl = process.env.REACT_APP_BASE_URL;

  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const { data } = await axios.get(`${baseUrl}/api/testimonials`);
        const list: APITestimonial[] = Array.isArray(data) ? data : data.items ?? [];

        // Default sort by updatedAt desc (fallback to createdAt)
        const sorted = [...list].sort((a, b) => {
          const av = a.updatedAt || a.createdAt || '';
          const bv = b.updatedAt || b.createdAt || '';
          // newer first
          return av < bv ? 1 : av > bv ? -1 : 0;
        });

        // Map API → Slide type for SwiperSlider
        const mapped: Slide[] = sorted.map((t) => ({
          statement: t.description,
          customer: {
            name: t.name,
            designation: t.position ?? '',
          },
        }));

        setSlides(mapped);
      } catch (err: any) {
        setErrorMsg(err?.response?.data?.message || 'Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [baseUrl]);

  return (
    <section
      id="testimonials"
      className="section py-3 py-sm-6 bg-gradient4 position-relative overflow-hidden"
      data-aos="fade-up"
      data-aos-duration="600"
    >
      <Container className="testimonials-3">
        <Row className="align-items-center">
          <Col>
            <h1 className="display-4 fw-bold">Words from Art Enthusiasts</h1>
          </Col>
          <Col xs="auto" className="text-sm-end pt-2 pt-sm-0">
            <div className="navigations">
              <Button variant="link" className="text-normal p-0 swiper-custom-prev" aria-label="Previous">
                <FeatherIcon icon="arrow-left" className="icon-dual-primary" />
              </Button>
              <Button variant="link" className="text-normal p-0 swiper-custom-next" aria-label="Next">
                <FeatherIcon icon="arrow-right" className="icon-dual-primary" />
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="mt-3 mt-sm-5">
          <Col>
            {loading ? (
              <div className="d-flex justify-content-center py-5">
                <Loading style={{ width: 80, height: 80 }} />
              </div>
            ) : errorMsg ? (
              <div className="alert alert-danger py-2 d-inline-flex align-items-center">
                <FeatherIcon icon="alert-triangle" className="me-2" />
                <span>{errorMsg}</span>
              </div>
            ) : slides.length === 0 ? (
              <p className="text-muted mb-0">No testimonials yet.</p>
            ) : (
              <div className="slider">
                <SwiperSlider slides={slides} />
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Testimonials;
