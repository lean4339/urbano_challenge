import { useState } from 'react';
import { Loader, Plus, X } from 'react-feather';
import { useForm } from 'react-hook-form';
import { useQuery, useQueryClient } from 'react-query';

import CoursesTable from '../components/courses/CoursesTable';
import Layout from '../components/layout';
import Paginator from '../components/Paginator';
import Modal from '../components/shared/Modal';
import useAuth from '../hooks/useAuth';
import CourseI from '../models/course/Course';
import CreateCourseRequest from '../models/course/CreateCourseRequest';
import courseService from '../services/CourseService';

export default function Courses() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [addCourseShow, setAddCourseShow] = useState<boolean>(false);
  const [error, setError] = useState<string>();
  const [courseFilters, setCourseFilters] = useState({
    name: '',
    description: '',
    page: 1,
    limit: 10,
    orderBy: 'name' as 'name' | 'description',
    orderDir: 'ASC' as 'ASC' | 'DESC',
  });
  const { authenticatedUser } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{
    data: CourseI[];
    total: number;
    page: number;
    limit: number;
  }>(
    ['courses', courseFilters],
    async () => {
      return await courseService.findAll({ ...courseFilters });
    },
    {
      enabled: true,
      cacheTime: 5 * 60 * 1000,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  );

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<CreateCourseRequest>();

  const saveCourse = async (createCourseRequest: CreateCourseRequest) => {
    try {
      await courseService.save(createCourseRequest);
      setAddCourseShow(false);
      reset();
      setError(null);
      queryClient.invalidateQueries([`courses`, courseFilters]);
    } catch (error) {
      setError(error.response.data.message);
    }
  };

  return (
    <Layout>
      <div className="py-5 px-5 w-full h-full bg-gray-100">
        <h1 className="text-3xl mb-5">Manage Courses</h1>
      </div>
      <hr />
      {authenticatedUser.role !== 'user' ? (
        <button
          className="btn my-5 flex gap-2 w-full sm:w-auto justify-center"
          onClick={() => setAddCourseShow(true)}
        >
          <Plus /> Add Course
        </button>
      ) : null}

      <div className="table-filter">
        <div className="flex flex-row gap-5">
          <input
            type="text"
            className="input w-1/2"
            placeholder="Name"
            value={courseFilters.name}
            onChange={(e) =>
              setCourseFilters((prev) => ({ ...prev, name: e.target.value }))
            }
          />
          <input
            type="text"
            className="input w-1/2"
            placeholder="Description"
            value={courseFilters.description}
            onChange={(e) =>
              setCourseFilters((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
          />
        </div>
      </div>

      {data && (
        <>
          <CoursesTable
            clear={() =>
              queryClient.invalidateQueries([`courses`, courseFilters])
            }
            data={data.data}
            isLoading={isLoading}
          />
          <Paginator
            page={courseFilters.page}
            totalPages={Math.ceil(data.data?.length / courseFilters.limit)}
            onPageChange={(newPage) =>
              setCourseFilters((prev) => ({ ...prev, page: newPage }))
            }
          />
        </>
      )}

      {/* Add User Modal */}
      <Modal show={addCourseShow}>
        <div className="flex">
          <h1 className="font-semibold mb-3">Add Course</h1>
          <button
            className="ml-auto focus:outline-none"
            onClick={() => {
              reset();
              setAddCourseShow(false);
            }}
          >
            <X size={30} />
          </button>
        </div>
        <hr />

        <form
          className="flex flex-col gap-5 mt-5"
          onSubmit={handleSubmit(saveCourse)}
        >
          <input
            type="text"
            className="input"
            placeholder="Name"
            disabled={isSubmitting}
            required
            {...register('name')}
          />
          <input
            type="text"
            className="input"
            placeholder="Description"
            disabled={isSubmitting}
            required
            {...register('description')}
          />
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
