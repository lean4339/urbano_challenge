import { useState } from 'react';
import { Loader, Plus, X } from 'react-feather';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from 'react-query';

import Layout from '../components/layout';
import Paginator from '../components/Paginator';
import Modal from '../components/shared/Modal';
import UsersTable from '../components/users/UsersTable';
import useAuth from '../hooks/useAuth';
import CreateUserRequest from '../models/user/CreateUserRequest';
import User from '../models/user/User';
import userService from '../services/UserService';
export default function Users() {
  const { authenticatedUser } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [addUserShow, setAddUserShow] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    firstName: '',
    lastName: '',
    username: '',
    role: '',
    page: 1,
    limit: 10,
    orderBy: 'firstName' as 'firstName' | 'lastName' | 'username',
    orderDir: 'ASC' as 'ASC' | 'DESC',
  });
  const [error, setError] = useState<string>();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{
    data: User[];
    total: number;
    page: number;
    limit: number;
  }>(
    ['users', filters],
    async () => {
      return await userService.findAll({
        ...filters,
      });
    },
    {
      enabled: true, // 🔥 Carga inicial al montar el componente
      cacheTime: 5 * 60 * 1000, // 🔥 Cache por 5 minutos
      staleTime: 60 * 1000, // 🔥 Datos frescos por 1 minuto
      refetchOnWindowFocus: false, // Evita refetch al cambiar de pestaña
    },
  );

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<CreateUserRequest>();

  const saveUser = async (createUserRequest: CreateUserRequest) => {
    try {
      await userService.save(createUserRequest);
      setAddUserShow(false);
      setError(null);
      reset();
      queryClient.invalidateQueries([`users`, filters]);
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <Layout>
      <div className="py-5 px-5 w-full h-full bg-gray-100">
        <h1 className="text-3xl mb-5">Manage Users</h1>
      </div>
      <hr />
      <button
        className="btn my-5 flex gap-2 w-full sm:w-auto justify-center"
        onClick={() => setAddUserShow(true)}
      >
        <Plus /> Add User
      </button>

      <div className="table-filter mt-2">
        <div className="flex flex-row gap-5">
          <input
            type="text"
            className="input w-1/2"
            placeholder="First Name"
            value={filters.firstName}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, firstName: e.target.value }))
            }
          />
          <input
            type="text"
            className="input w-1/2"
            placeholder="Last Name"
            value={filters.lastName}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, lastName: e.target.value }))
            }
          />
        </div>
        <div className="flex flex-row gap-5">
          <input
            type="text"
            className="input w-1/2"
            placeholder="Username"
            value={filters.username}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, username: e.target.value }))
            }
          />
          <select
            name=""
            id=""
            className="input w-1/2"
            value={filters.role}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, role: e.target.value }))
            }
          >
            <option value="">All</option>
            <option value="user">User</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {data && (
        <>
          <UsersTable
            clear={() => queryClient.invalidateQueries([`users`, filters])}
            data={data.data}
            isLoading={isLoading}
          />
          <Paginator
            page={filters.page}
            totalPages={Math.ceil(data.data?.length / filters.limit)}
            onPageChange={(newPage) =>
              setFilters((prev) => ({ ...prev, page: newPage }))
            }
          />
        </>
      )}

      {/* Add User Modal */}
      <Modal show={addUserShow}>
        <div className="flex">
          <h1 className="font-semibold mb-3">Add User</h1>
          <button
            className="ml-auto focus:outline-none"
            onClick={() => {
              reset();
              setError(null);
              setAddUserShow(false);
            }}
          >
            <X size={30} />
          </button>
        </div>
        <hr />

        <form
          className="flex flex-col gap-5 mt-5"
          onSubmit={handleSubmit(saveUser)}
        >
          <div className="flex flex-col gap-5 sm:flex-row">
            <input
              type="text"
              className="input sm:w-1/2"
              placeholder="First Name"
              required
              disabled={isSubmitting}
              {...register('firstName')}
            />
            <input
              type="text"
              className="input sm:w-1/2"
              placeholder="Last Name"
              required
              disabled={isSubmitting}
              {...register('lastName')}
            />
          </div>
          <input
            type="text"
            className="input"
            required
            placeholder="Username"
            disabled={isSubmitting}
            {...register('username')}
          />
          <input
            type="password"
            className="input"
            required
            placeholder="Password (min 6 characters)"
            disabled={isSubmitting}
            {...register('password')}
          />
          <select
            className="input"
            required
            {...register('role')}
            disabled={isSubmitting}
          >
            <option value="user">User</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <button className="btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader className="animate-spin mx-auto" />
            ) : (
              'Save'
            )}
          </button>
          {error ? (
            <div className="text-red-500 p-3 font-semibold border rounded-md bg-red-50">
              {error}
            </div>
          ) : null}
        </form>
      </Modal>
    </Layout>
  );
}
