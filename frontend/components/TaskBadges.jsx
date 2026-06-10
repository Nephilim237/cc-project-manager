import React from "react";

// Badge de statut
export const StatusBadge = ({status}) => {
    const config = {
        "to-do": {label: "A faire", className: "badge badge-todo"},
        "to-progress": {label: "En cours", className: "badge badge-inprogress"},
        "testing": {label: "En test", className: "badge badge-testing"},
        "done": {label: "Termine", className: "badge badge-done"},
    };

    const {label, className} = config[status] || {label: status, className: "badge badge-todo"};

    return <span className={className}>{label}</span>;
};

// Badge de priorite
export const PriorityBadge = ({priority}) => {
    const config = {
        "low": {label: "Basse", className: "badge badge-low"},
        "medium": {label: "Moyenne", className: "badge badge-medium"},
        "high": {label: "Haute", className: "badge badge-high"},
        "urgent": {label: "Urgent", className: "badge badge-urgent"},
    };

    const {label, className} = config[priority] || {label: priority, className: "badge badge-low"};

    return <span className={className}>{label}</span>;
};

// Classe de bordure selon la priorite (pour les cartes)
export const getPriorityCardClass = (priority) => {
    const map = {
        "low": "card card-priority-low",
        "medium": "card card-priority-medium",
        "high": "card card-priority-high",
        "urgent": "card card-priority-urgent",
    };

    return map[priority] || "card";
}
