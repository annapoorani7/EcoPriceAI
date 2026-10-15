import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { hotelService } from '../../services/apiService';
import HotelProfile from './HotelProfile';

jest.mock('../../services/apiService', () => ({
  hotelService: {
    getMyHotel: jest.fn(),
    updateMyHotel: jest.fn(),
  },
}));

const hotelRecord = {
  _id: 'hotel-1',
  name: 'Riverlight Lodge',
  email: 'stay@riverlight.example',
  phone: '+1 555 0100',
  address: '12 River Road',
  images: [],
  owner: { _id: 'owner-1', name: 'Hotel Owner' },
};

beforeEach(() => {
  jest.clearAllMocks();
  hotelService.getMyHotel.mockResolvedValue({ hotel: hotelRecord });
});

test('loads the owner hotel profile and uses a valid logo fallback', async () => {
  render(<HotelProfile />);

  expect(await screen.findByRole('heading', { name: 'Riverlight Lodge' })).toBeInTheDocument();
  expect(screen.getByText('stay@riverlight.example')).toBeInTheDocument();
  expect(screen.getByText('+1 555 0100')).toBeInTheDocument();
  expect(screen.getByText('12 River Road')).toBeInTheDocument();
  expect(screen.getByText('Hotel Owner')).toBeInTheDocument();
  expect(screen.getByRole('img', { name: 'Riverlight Lodge logo' })).toHaveAttribute('src', '/logo192.png');
  expect(hotelService.getMyHotel).toHaveBeenCalledTimes(1);
});

test('saves profile edits and refreshes the displayed hotel data', async () => {
  hotelService.updateMyHotel.mockResolvedValue({
    hotel: { ...hotelRecord, name: 'Riverlight Inn', phone: '+1 555 0101' },
  });
  render(<HotelProfile />);

  fireEvent.click(await screen.findByRole('button', { name: 'Edit Profile' }));
  fireEvent.change(screen.getByLabelText('Hotel name'), { target: { value: 'Riverlight Inn' } });
  fireEvent.change(screen.getByDisplayValue('+1 555 0100'), { target: { value: '+1 555 0101' } });
  fireEvent.click(screen.getByRole('button', { name: 'Save Profile' }));

  await waitFor(() => expect(hotelService.updateMyHotel).toHaveBeenCalledWith({
    name: 'Riverlight Inn',
    email: 'stay@riverlight.example',
    phone: '+1 555 0101',
    address: '12 River Road',
  }));
  expect(await screen.findByRole('heading', { name: 'Riverlight Inn' })).toBeInTheDocument();
  expect(screen.getByText('+1 555 0101')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Hotel profile saved.');
});

test('renders missing optional values without substituting account details', async () => {
  hotelService.getMyHotel.mockResolvedValue({
    hotel: { _id: 'hotel-2', name: 'Quiet Stay', images: [], owner: { name: 'Account Owner' } },
  });
  render(<HotelProfile />);

  expect(await screen.findByRole('heading', { name: 'Quiet Stay' })).toBeInTheDocument();
  expect(screen.getAllByText('Not provided')).toHaveLength(3);
  expect(screen.getByText('Account Owner')).toBeInTheDocument();
});

test('shows the server authorization error instead of inventing a hotel profile', async () => {
  hotelService.getMyHotel.mockRejectedValue(new Error('You are not authorized to view this hotel.'));
  render(<HotelProfile />);

  expect(await screen.findByRole('alert')).toHaveTextContent('You are not authorized to view this hotel.');
  expect(screen.queryByText('Current account')).not.toBeInTheDocument();
});