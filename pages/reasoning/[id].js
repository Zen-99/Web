import React, { useEffect, useId } from "react";
import { useRouter } from "next/router";
import { useState } from "react";
import { Pie, Line } from "react-chartjs-2";
import ExplainPopup from "../../components/reasoning/model/explain-model";
import { FiChevronLeft } from "react-icons/fi";
import Link from "next/link";

import {
  Chart,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Legend,
} from "chart.js";
import { getJob } from "../../apiCalls/jobApiCalls";
import FullPageLoader from "../../components/common/FullPageLoader";
Chart.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement
);
const Reasoning = () => {
  const router = useRouter();
  const { id } = router.query;

  const bigId = id?.split("-");

  const [jobId, setJobId] = useState(bigId && bigId[0].toString());
  const [userId, setUserId] = useState(bigId && bigId[1].toString());
  const [job, setJob] = useState([]);
  const [loading, setLoading] = useState(true);
  const [personaScoring, setPersonaScoring] = useState(null);
  const [barGraphData, setBarGraphData] = useState({});

  console.log(bigId);
  console.log(jobId);
  console.log(userId);

  const [user, setUser] = useState(null);

  const [isExplainabilityOpen, setExplainabilityOpen] = useState(false);
  const handleExplainabilityOpen = () => {
    setExplainabilityOpen(true);
  };
  const handleExplainabilityClose = () => {
    setExplainabilityOpen(false);
  };

  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    const userJson = JSON.parse(storedUserData);
    setUser(userJson);
    setLoading(true);
    const fetchData = async () => {
      try {
        const { data: jobData = [], loading } = await getJob(
          jobId,
          userJson?.accessToken
        );
        console.log(jobData);
        setJob((prev) => jobData);
        setPersonaScoring((prev) => {
          const personaMatchingScore = {};
          if (jobData?.persona_matching_score) {
            setPersonaScoring((prev) => {
              const personaMatchingScore = {};
              jobData?.persona_matching_score.forEach((data, index) => {
                if (data?.candidate_id == userId) {
                  personaMatchingScore = {
                    candidate_id: data?.candidate_id ?? null,
                    overall_score: data?.overall_score.toFixed(2),
                    education: (data?.education * 100).toFixed(2),
                    soft_skills: (data?.soft_skills * 100).toFixed(2),
                    technical_skills: (data?.technical_skills * 100).toFixed(2),
                    experience: (data?.experience * 100).toFixed(2),
                  };
                }
              });
              return personaMatchingScore;
            });
          }
          return personaMatchingScore;
        });
        setBarGraphData({
          labels: [
            "Education",
            "Technical Skills",
            "Soft Skills",
            "Experience",
          ],
          datasets: [
            {
              data: [
                jobData?.w_education,
                jobData?.w_technical_skills,
                jobData?.w_soft_skills,
                jobData?.w_experience,
              ],
              backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#FFCC00"],
            },
          ],
        });
        setLoading(loading);
      } catch (error) {
        console.error("Error job fetching:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, jobId]);

  const data = {
    labels: ["Food", "Transportation", "Rent", "Utilities"],
    datasets: [
      {
        data: [20, 25, 40, 10],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#FFCC00"],
      },
    ],
  };

  const options = {
    // Show the legend
    plugins: {
      legend: {
        display: true, // Enable the legend display
        labels: {
          fontColor: "black", // Customize legend text color
        },
        position: "right", // Set legend position (default: 'top')
      },
    },
  };
  return !loading ? (
    <div className="h-screen flex flex-col gap-4">
      <div className="rounded max-w-3xl w-full mt-10">
        <button className="btn bg-slate-200 hover:bg-slate-300 dark:bg-dark-card dark:hover:bg-hover-color">
          <Link href={`/shortlist/${jobId}`}>
            <a className="flex-align-center">
              <FiChevronLeft />
              <span>back</span>
            </a>
          </Link>
        </button>
      </div>
      <div className="flex flex-row gap-4 self-center mt-4 mb-4 text-2xl font-semibold">
        Explaination of the Results
      </div>
      <div className="h-64 flex flex-row gap-4">
        <div className="w-1/2 flex flex-row rounded-md overflow-hidden border p-4 gap-4 justify-center bg-white dark:bg-dark-main">
          <div className="w-full h-full flex flex-col gap-4 m-4 justify-center item-center self-center border-r-2">
            <div className="flex text-2xl font-semibold">Overall Score</div>
            <div className="flex text-2xl font-semibold">
              {personaScoring?.overall_score}%
            </div>
          </div>
          <div className="w-full h-full flex flex-col gap-4 justify-center">
            <div className="flex text-2xl font-semibold">Contribution</div>
            <div className="flex flex-row gap-2">
              <div className="flex">Education</div>
              <div className="flex">{personaScoring?.education}%</div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="flex">Technical Skills</div>
              <div className="flex">{personaScoring?.technical_skills}%</div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="flex">Soft Skills</div>
              <div className="flex">{personaScoring?.soft_skills}%</div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="flex">Experience</div>
              <div className="flex">{personaScoring?.experience}%</div>
            </div>
          </div>
        </div>
        <div className="flex flex-row w-1/2 rounded-md overflow-hidden border p-4 gap-4 bg-white dark:bg-dark-main">
          <div className="w-1/2 h-full flex flex-col gap-4 justify-center item-center self-center border-r-2">
            <Pie data={barGraphData} />
          </div>
          <div className="w-1/2 h-full flex flex-col gap-4 justify-center">
            <div className="flex text-2xl font-semibold">Allocated Weights</div>
            <div className="flex flex-row gap-2">
              <div className="flex">Education</div>
              <div className="flex">{job?.w_education * 10}%</div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="flex">Technical Skills</div>
              <div className="flex">{job?.w_technical_skills * 10}%</div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="flex">Soft Skills</div>
              <div className="flex">{job?.w_soft_skills * 10}%</div>
            </div>
            <div className="flex flex-row gap-2">
              <div className="flex">Experience</div>
              <div className="flex">{job?.w_experience * 10}%</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-row gap-4 self-center mt-10 mb-4 text-2xl font-semibold">
        Categories
      </div>
      <div className="h-55 flex flex-row gap-4">
        <div className="w-1/4 flex flex-col rounded-md overflow-hidden border p-4 gap-4 bg-white dark:bg-dark-main">
          <div className="flex flex-row gap-4">
            <div className="flex">Education</div>
            <div className="flex">{personaScoring?.education}%</div>
          </div>
          <button
            onClick={handleExplainabilityOpen}
            className="btn btn-primary"
          >
            Statistics
          </button>
          {isExplainabilityOpen && (
            <ExplainPopup
              onClose={handleExplainabilityClose}
              title={"Education"}
            />
          )}
        </div>
        <div className="w-1/4 flex flex-col rounded-md overflow-hidden border p-4 gap-4 bg-white dark:bg-dark-main">
          <div className="flex flex-row gap-4">
            <div className="flex">Technical Skills</div>
            <div className="flex">{personaScoring?.technical_skills}%</div>
          </div>
          <button className="btn btn-primary">Statistics</button>
        </div>
        <div className="w-1/4 flex flex-col rounded-md overflow-hidden border p-4 gap-4 bg-white dark:bg-dark-main">
          <div className="flex flex-row gap-4">
            <div className="flex">Soft Skills</div>
            <div className="flex">{personaScoring?.soft_skills}%</div>
          </div>
          <button className="btn btn-primary">Statistics</button>
        </div>
        <div className="w-1/4 flex flex-col rounded-md overflow-hidden border p-4 gap-4 bg-white dark:bg-dark-main">
          <div className="flex flex-row gap-4">
            <div className="flex">Experience</div>
            <div className="flex">{personaScoring?.experience}%</div>
          </div>
          <button className="btn btn-primary">Statistics</button>
        </div>
      </div>
    </div>
  ) : (
    <div>
      <FullPageLoader />
    </div>
  );
};

export default Reasoning;