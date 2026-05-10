import { useContext } from 'react';
import { UserContext } from '../context/UserContext.js';

const useUser = () => useContext(UserContext);

export default useUser;
