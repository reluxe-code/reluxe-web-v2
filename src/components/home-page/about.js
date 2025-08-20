import Link from 'next/link';
import Image from 'next/image';

function About() {
    const subTitle = `text-[18px] leading-[32px] text-secondary uppercase`;
    const title = `lm:text-[42px] lm:leading-[50px] text-[32px] text-black mb-[35px] lg:max-w-[460px]`;
    const desc = `text-[14px] leading-[25px] text-secondary mb-[80px] lg:max-w-[490px]`;
    const aboutImage = `flex justify-end relative`;
    return (
        <div id="about" className="about-area md:pt-[150px] pt-[50px]">
            <div className="container max-lg:max-w-full fixed-lg:pr-0">
                <div className="lg:grid lg:grid-cols-2 max-md:flex max-md:flex-col-reverse items-center">
                    <div className="about-content max-md:pt-10">
                        <span className={subTitle}>About Us</span>
                        <h2 className={title}>
                            We are a <span class="gradient-text">local, family owned</span> Med Spa
                        </h2>
                        <h3 className="text-secondary text-2xl mb-12">
                            We’re your neighbors in Westfield & Carmel,<br />
                            not a faceless chain.<br />  <br /> 
                                • Family-founded and owned  <br />
                                • Boutique, personalized care  <br />
                                • Honest expertise, zero surprises<br />
                        </h3>
                        <Link href="/about" className="boxed-btn text-[18px] leading-[30px]">
                            More About RELUXE
                        </Link>
                    </div>
                    <div className={aboutImage}>
                        <Image
                            src="/images/home-about.png"
                            alt="RELUXE Family About Us"
                            width={540}
                            height={675}
                            quality={80}
                            layout="fixed"
                            objectFit="cover"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default About;
