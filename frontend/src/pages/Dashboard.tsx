/* eslint-disable prettier/prettier */
import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';

import Layout from '../components/layout';
import useAuth from '../hooks/useAuth';
import contentService from '../services/ContentService';
import statsService from '../services/StatsService';

export default function Dashboard() {
  const { authenticatedUser } = useAuth();
  const { data, isLoading } = useQuery('stats', () => statsService.getStats());
  const {
    data: novedades,
    isLoading: isLoadingUpdates,
  } = useQuery('latestUpdates', () => contentService.findLatestUpdates());
  function getImageUrl(url) {
    if (!url) return "/img/error.png"; // Fallback image if URL is missing
    if (url.startsWith("data:image")) return url; // ✅ If it's already Base64, use it directly
    return `/api${url}`; // ✅ Use normal URL if it's not Base64
  }
  return (
    <Layout>
      <div className="w-full py-5 px-5 h-full bg-gray-100">
        <h1 className="text-3xl mb-5">Dashboard</h1>
      </div>
      <hr />
      <div className="mt-5 flex flex-col gap-5">
        {!isLoading && !isLoadingUpdates && (
          <div className="mt-5 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row gap-5">
              {authenticatedUser.role === 'admin' && (
                <div className="card shadow text-white bg-blue-500 flex-1">
                  <h1 className="font-semibold sm:text-4xl text-center mb-3">
                    {data.numberOfUsers}
                  </h1>
                  <p className="text-center sm:text-lg font-semibold">Users</p>
                </div>
              )}
              <div className="card shadow text-white bg-indigo-500 flex-1">
                <h1 className="font-semibold sm:text-4xl mb-3 text-center">
                  {data.numberOfCourses}
                </h1>
                <p className="text-center sm:text-lg font-semibold">Courses</p>
              </div>
              <div className="card shadow text-white bg-green-500 flex-1">
                <h1 className="font-semibold sm:text-4xl mb-3 text-center">
                  {data.numberOfContents}
                </h1>
                <p className="text-center sm:text-lg font-semibold">Contents</p>
              </div>
            </div>
          </div>
        )}
        <Link to="/profile" className="text-blue-500 font-semibold">
          Perfil
        </Link>
        <>
          <div className="mt-5 p-5 bg-white shadow-lg rounded-lg">
            <h2 className="text-xl font-bold mb-4">Novedades de los cursos</h2>
            <div className="max-h-80 overflow-y-auto">
              {!isLoadingUpdates &&
                novedades.data.map(({ id, course, update, date, url }) => (
                  <div key={id} className="p-4 border-b last:border-none">
                    <h3 className="font-semibold text-lg text-blue-600">
                      {course}
                    </h3>
                    {url ? (
                      <img
                        src={`/api${url}`}
                        alt={course}
                        className="w-20 h-20 rounded-full"
                      />
                    ) : (
                      <p className="text-gray-500">Imagen no disponible</p>
                    )}
                    <p className="text-gray-700">{update}</p>
                    <p className="text-gray-500 text-sm">
                      {new Date(date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </>
      </div>
    </Layout>
  );
}