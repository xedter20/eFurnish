import { BsFillClockFill, BsGeoAltFill, BsTelephoneFill } from "react-icons/bs";

const ContactDetails = () => {
  return (
    <div>
      <div className="flex gap-6 md:justify-start md:gap-[1.8rem]">
        <BsGeoAltFill size={23} />
        <div>
          <h4 className="text-2xl font-medium leading-[1rem]">Address</h4>
          <p className="mt-2 max-w-52">
            Zone 2, San Jose, Alanao Lupi Camarines Sur
          </p>
        </div>
      </div>

      <div className="my-[1.8rem] flex gap-6 md:gap-[1.8rem]">
        <BsTelephoneFill size={20} />
        <div>
          <h4 className="text-2xl font-medium leading-[1rem]">Phone</h4>
          <p className="mt-2">Mobile: +(63)</p>
          <p>Hotline: +(63)</p>
        </div>
      </div>

      <div className="flex gap-6 md:gap-[1.8rem]">
        <BsFillClockFill size={21} />
        <div>
          <h4 className="text-2xl font-medium leading-[1rem]">Working Time</h4>
          <p className="mt-2">Monday-Friday: 8:00 AM- 5:00 PM</p>
          <p>Saturday-Sunday: 8:00 AM - 5:00 PM</p>
        </div>
      </div>
    </div>
  );
};

export default ContactDetails;
