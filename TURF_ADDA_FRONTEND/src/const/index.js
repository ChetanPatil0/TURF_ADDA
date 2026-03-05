import {
  HiOutlineArrowLeft,
  HiOutlineArrowRight,
  HiOutlineCheckCircle,
  HiOutlineCurrencyRupee,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlinePhotograph,
  HiOutlineVideoCamera,
  HiChevronDown,
} from 'react-icons/hi';
import {
  MdStadium,
  MdLocalParking,
  MdMeetingRoom,
  MdShower,
  MdWc,
  MdLightbulbOutline,
  MdWifi,
  MdEventSeat,
  MdMedicalServices,
  MdPower,
  MdScoreboard,
  MdSportsSoccer,
  MdSportsCricket,
  MdSportsBasketball,
  MdSportsTennis,
  MdDescription,
  MdMap,
  MdPhone,
} from 'react-icons/md';
import { IoFootballOutline, IoWaterOutline, IoRestaurantOutline } from 'react-icons/io5';

export const BASE_URL_MEDIA = 'http://localhost:5000'



  export const amenitiesList = [
    { value: 'parking', label: 'Parking', icon: MdLocalParking },
    { value: 'changing_room', label: 'Changing Room', icon: MdMeetingRoom },
    { value: 'shower', label: 'Shower', icon: MdShower },
    { value: 'restroom', label: 'Restroom', icon: MdWc },
    { value: 'lighting', label: 'Floodlights', icon: MdLightbulbOutline },
    { value: 'drinking_water', label: 'Drinking Water', icon: IoWaterOutline },
    { value: 'seating', label: 'Seating', icon: MdEventSeat },
    { value: 'first_aid', label: 'First Aid', icon: MdMedicalServices },
    { value: 'cafeteria', label: 'Cafeteria', icon: IoRestaurantOutline },
    { value: 'wifi', label: 'WiFi', icon: MdWifi },
    { value: 'power_backup', label: 'Power Backup', icon: MdPower },
    { value: 'scoreboard', label: 'Scoreboard', icon: MdScoreboard },
  ];

  export const sportOptions = [
    { value: 'football', label: 'Football', icon: IoFootballOutline },
    { value: 'cricket', label: 'Cricket', icon: MdSportsCricket },
    { value: 'futsal', label: 'Futsal', icon: MdSportsSoccer },
    { value: 'badminton', label: 'Badminton', icon: MdSportsTennis },
    { value: 'basketball', label: 'Basketball', icon: MdSportsBasketball },
    { value: 'volleyball', label: 'Volleyball', icon: MdSportsTennis },
    { value: 'tennis', label: 'Tennis', icon: MdSportsTennis },
    { value: 'kabaddi', label: 'Kabaddi', icon: MdStadium },
    { value: 'hockey', label: 'Hockey', icon: MdSportsSoccer },
    { value: 'rugby', label: 'Rugby', icon: MdSportsSoccer },
    { value: 'table_tennis', label: 'Table Tennis', icon: MdSportsTennis },
    // { value: 'other', label: 'Other', icon: MdStadium },
  ];

  export const surfaceOptions = [
    { value: 'natural_grass', label: 'Natural Grass' },
    { value: 'artificial_turf', label: 'Artificial Turf' },
    { value: 'cement', label: 'Cement' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'mat', label: 'Mat' },
  ];

  export const sizeOptions = [
    { value: '5-a-side', label: '5-a-side' },
    { value: '7-a-side', label: '7-a-side' },
    { value: '9-a-side', label: '9-a-side' },
    { value: '11-a-side', label: '11-a-side' },
    { value: 'full-court', label: 'Full Court' },
    { value: 'other', label: 'Other' },
  ];

  export const slotDurations = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '60 minutes' },
    { value: 90, label: '90 minutes' },
    { value: 120, label: '120 minutes' },
  ];